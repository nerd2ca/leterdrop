var words = {}, letters = ''
m.request('words', {responseType: 'text'}).then(resp => {
    resp.split('\n').map(word => {
        if (word == word.toLowerCase())
            words[word] = true
    })
    var j=0
    for (let i=0; i<resp.length; i++) {
        let c = resp.charCodeAt(i)
        if (c >= 97 && c <= 122) {
            letters = letters + resp[i]
            j++
        }
    }
})
const Button = {
    view: button => {
        return m('.', {
            style: {
                display: 'inline-block',
                margin: '0.2em 0',
                padding: '0.1em 1em',
                fontSize: '1.5em',
                border: '1px solid #449',
                borderRadius: '0.3em',
                background: '#225',
                textAlign: 'center',
                cursor: 'pointer',
                color: '#fff',
            },
            onclick: button.attrs.onclick,
        }, button.children)
    },
}
const Letter = {
    view: letter => {
        return m('.', {
            style: {
                background: letter.attrs.background,
                display: 'inline-block',
                padding: '0.1em',
                border: '1px dashed #555',
                borderRadius: '0.1em',
                color: letter.attrs.rune ? '#fff' : '#000',
                fontSize: '3em',
                fontWeight: 'bold',
                width: '1.1em',
                height: '1.1em',
                textAlign: 'center',
                cursor: 'pointer',
            },
            onclick: e => {
                e.preventDefault()
                letter.attrs.take()
            },
        }, [
            letter.attrs.rune || '-',
        ])
    },
}
function Score() {
    return {
        view: vnode => {
            return m('.', {
                style: {
                    background: vnode.attrs.background,
                    display: 'inline-block',
                    padding: '0.1em',
                    border: '1px dashed #555',
                    borderRadius: '0.1em',
                    color: vnode.attrs.color,
                    fontSize: '3em',
                    fontWeight: 'bold',
                    width: '4em',
                    height: '1.1em',
                    textAlign: 'right',
                },
            }, [
                vnode.attrs.score,
            ])
        },
    }
}

function Board() {
    const gridw = 8, gridh = 8, minwordlen = 3
    var rows, next, prizes, highlight, score, hiscore
    return {
        oninit: vnode => {
            board = []
            for (let y=0; y<gridh; y++) {
                let r = []
                for (let x=0; x<gridw; x++) {
                    r.push(null)
                }
                board.push(r)
            }
            next = 'a'
            prizes = []
            highlight = {}
            score = 0
            hiscore = window.localStorage.getItem('hiscore') || 0
        },
        view: vnode => {
            if (!words.righteous) return
            return m('.', {
                style: {
                    background: '#000',
                    width: '100%',
                    height: '100%',
                },
            }, [
                m(Letter, {rune: next, background: '#442'}),
                m(Score, {score: score, background: '#030', color: '#bfb'}),
                m(Score, {score: hiscore, background: '#030', color: '#9b9'}),
                board.map((cols, row) => {
                    return [
                        m('br'),
                        cols.map((rune, col) => {
                            return m(Letter, {
                                rune: rune,
                                background: highlight[''+row+','+col] ? '#050' : '#000',
                                take: _ => {
                                    if (rune) return
                                    board[row][col] = next
                                    let prev = next
                                    while (prev == next)
                                        next = letters[Math.floor(Math.random()*letters.length)]
                                    givePrizes(row, col)
                                },
                            })
                        }),
                    ]
                }),
                m('br'),
                m(Button, {
                    onclick: e => {
                        e.preventDefault()
                        board.map(cols => {
                            return cols.map((_, col) => { cols[col] = null })
                        })
                        prizes = []
                        next = 'a'
                        highlight = {}
                        score = 0
                    },
                }, 'clear'),
                m('br'),
                m('p', {
                    style: {
                        color: '#bfb',
                    },
                }, prizes.map(word => {
                    return [word.toLowerCase(), ' ']
                })),
            ])
        },
    }
    function givePrizes(prizeRow, prizeCol) {
        highlight = {}
        for (let startcol=0; startcol<=prizeCol; startcol++)
            for (var endcol=Math.max(prizeCol+1, startcol+minwordlen); endcol<=gridw; endcol++) {
                var word = ''
                for (let col=startcol; col<endcol; col++)
                    word += board[prizeRow][col] || ' '
                if (words[word]) {
                    prizes.push(word)
                    score += Math.floor(Math.exp(word.length))
                    for (let col=startcol; col<endcol; col++)
                        highlight[''+prizeRow+','+col] = true
                } else
                    console.log('no "'+word+'"')
            }
        for (let startrow=0; startrow<=prizeRow; startrow++)
            for (let endrow=Math.max(prizeRow+1, startrow+minwordlen); endrow<=gridh; endrow++) {
                var word = ''
                for (let row=startrow; row<endrow; row++)
                    word += board[row][prizeCol] || ' '
                if (words[word]) {
                    prizes.push(word)
                    score += Math.floor(Math.exp(word.length))
                    for (let row=startrow; row<endrow; row++)
                        highlight[''+row+','+prizeCol] = true
                } else
                    console.log('no '+word)
            }
        if (score > hiscore) {
            hiscore = score
            window.localStorage.setItem('hiscore', hiscore)
        }
    }
}

document.body.style.margin = 0
m.mount(document.body, Board)
