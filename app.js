var words = {}
m.request('words', {responseType: 'text'}).then(r => {
    r.split('\n').map(word => {
        words[word.toLowerCase()] = true
    })
})
const Letter = {
    view: letter => {
        return m('.', {
            style: {
                display: 'inline-block',
                padding: '0.1em',
                border: '1px dashed #999',
                borderRadius: '0.1em',
                color: letter.attrs.rune ? '#fff' : '#000',
                fontSize: '3em',
                fontWeight: 'bold',
                width: '1.1em',
                height: '1.1em',
                margin: 'auto',
            },
            onclick: letter.attrs.take,
        }, [
            letter.attrs.rune || '-',
        ])
    },
}

const Board = {
    oninit: board => {
        const gridw = 6, gridh = 6
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
                                board.state.next = String.fromCharCode(65 + Math.random()*26)
                            },
                        })
                    }),
                ]
            }),
        ])
    },
}

document.body.style.margin = 0
m.mount(document.body, Board)
