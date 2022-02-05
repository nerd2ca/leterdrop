var words = {}, letters = ''
m.request('words', {responseType: 'text'}).then(resp => {
    resp = resp.toUpperCase()
    resp.split('\n').map(word => {
        words[word] = true
    })
    var j=0
    for (let i=0; i<resp.length; i++) {
        let c = resp.charCodeAt(i)
        if (c >= 65 && c <= 90) {
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
            },
            onclick: letter.attrs.take,
        }, [
            letter.attrs.rune || '-',
        ])
    },
}

const Board = {
    oninit: board => {
        const gridw = 8, gridh = 8
        board.state.rows = []
        for (let y=0; y<gridh; y++) {
            let r = []
            for (let x=0; x<gridw; x++) {
                r.push(null)
            }
            board.state.rows.push(r)
        }
        board.state.next = 'A'
    },
    view: board => {
        if (!words.RIGHTEOUS) return
        return m('.', {
            style: {
                background: '#000',
                width: '100%',
                height: '100%',
            },
        }, [
            m(Letter, {rune: board.state.next}),
            board.state.rows.map((cols, row) => {
                return [
                    m('br'),
                    cols.map((rune, col) => {
                        return m(Letter, {
                            rune: rune,
                            take: _ => {
                                if (rune) return
                                board.state.rows[row][col] = board.state.next
                                board.state.next = letters[Math.floor(Math.random()*letters.length)]
                            },
                        })
                    }),
                ]
            }),
            m('br'),
            m(Button, {
                onclick: e => {
                    board.state.rows.map(cols => {
                        return cols.map((_, col) => { cols[col] = null })
                    })
                },
            }, 'clear'),
        ])
    },
}

document.body.style.margin = 0
m.mount(document.body, Board)
