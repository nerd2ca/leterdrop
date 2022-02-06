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
function Button() {
    return {
        view: vnode => {
            return m('.button', {
                style: {
                    fontSize: ''+(vnode.attrs.size*0.7)+'px',
                },
                onclick: vnode.attrs.onclick,
            }, vnode.children)
        },
    }
}
function Letter() {
    return {
        view: vnode => {
            return m('.letter', {
                style: {
                    background: vnode.attrs.background,
                    color: vnode.attrs.rune ? '#fff' : '#000',
                    fontSize: ''+(vnode.attrs.size*0.7)+'px',
                    width: ''+vnode.attrs.size+'px',
                    height: ''+vnode.attrs.size+'px',
                },
                onclick: e => {
                    e.preventDefault()
                    vnode.attrs.take()
                },
            }, [
                vnode.attrs.rune || '-',
            ])
        },
    }
}
function Score() {
    return {
        view: vnode => {
            return m('.score', {
                style: {
                    background: vnode.attrs.background,
                    color: vnode.attrs.color,
                    fontSize: ''+(vnode.attrs.size*0.7)+'px',
                    width: ''+(vnode.attrs.size*3)+'px',
                    height: ''+vnode.attrs.size+'px',
                },
            }, [
                vnode.attrs.score,
            ])
        },
    }
}

function Board() {
    const gridw = 8, gridh = 8, minwordlen = 3
    var sqsize
    var rows, next, prizes, highlight, score, hiscore
    const nbsp = m.trust('&nbsp')
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
            window.addEventListener('resize', setSize)
            window.addEventListener('orientationchange', setSize)
            setSize()
        },
        view: vnode => {
            if (!words.righteous) return
            return m('.board', [
                m(Letter, {size: sqsize, rune: next, background: '#442'}),
                m(Score, {size: sqsize, score: score, background: '#030', color: '#bfb'}),
                m(Score, {size: sqsize, score: hiscore, background: '#030', color: '#9b9'}),
                m('.', {
                    style: {
                        whiteSpace: 'nowrap',
                    },
                }, [
                    board.map((cols, row) => {
                        return [
                            m('br'),
                            cols.map((rune, col) => {
                                return m(Letter, {
                                    size: sqsize,
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
                ]),
                m('br'),
                m(Button, {
                    size: sqsize,
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
                    return [word.toLowerCase(), nbsp, ' ']
                })),
            ])
        },
    }
    function setSize() {
        sqsize = Math.min(
            window.innerWidth / gridw,
            window.innerHeight / (gridh + 3)) - 2
        m.redraw()
    }
    function givePrizes(prizeRow, prizeCol) {
        highlight = {}
        let rowscore = 0
        for (let startcol=0; startcol<=prizeCol; startcol++)
            for (var endcol=Math.max(prizeCol+1, startcol+minwordlen); endcol<=gridw; endcol++) {
                var word = ''
                for (let col=startcol; col<endcol; col++)
                    word += board[prizeRow][col] || ' '
                if (words[word]) {
                    prizes.push(word)
                    rowscore += Math.floor(Math.exp(word.length))
                    for (let col=startcol; col<endcol; col++)
                        highlight[''+prizeRow+','+col] = true
                } else
                    console.log('no "'+word+'"')
            }
        let colscore = 0
        for (let startrow=0; startrow<=prizeRow; startrow++)
            for (let endrow=Math.max(prizeRow+1, startrow+minwordlen); endrow<=gridh; endrow++) {
                var word = ''
                for (let row=startrow; row<endrow; row++)
                    word += board[row][prizeCol] || ' '
                if (words[word]) {
                    prizes.push(word)
                    colscore += Math.floor(Math.exp(word.length))
                    for (let row=startrow; row<endrow; row++)
                        highlight[''+row+','+prizeCol] = true
                } else
                    console.log('no '+word)
            }
        if (rowscore && colscore)
            score += rowscore * colscore
        else
            score += rowscore + colscore
        hiscore = window.localStorage.getItem('hiscore') || 0
        if (score > hiscore) {
            hiscore = score
            window.localStorage.setItem('hiscore', hiscore)
        }
    }
}

document.body.style.margin = 0
m.mount(document.body, Board)
