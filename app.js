const Letter = {
    view: vnode => {
        return m('.', {
            style: {
                display: 'inline-block',
                padding: '0.1em',
                border: '1px dashed #999',
                borderRadius: '0.1em',
                color: '#fff',
                fontSize: '3em',
                fontWeight: 'bold',
                width: '1.1em',
                height: '1.1em',
                margin: 'auto',
            },
        }, [
            vnode.attrs.rune,
        ])
    },
}

const Page = {
    oninit: vnode => {
        const gridw = 6, gridh = 6
        vnode.state.rows = []
        for (let y=0; y<gridh; y++) {
            let r = []
            for (let x=0; x<gridw; x++) {
                r.push(null)
            }
            vnode.state.rows.push(r)
        }
    },
    view: vnode => {
        return m('.', {
            style: {
                background: '#000',
                width: '100%',
                height: '100%',
            },
        }, [
            m(Letter, {rune: 'A'}),
            vnode.state.rows.map(cols => {
                return [
                    m('br'),
                    cols.map(rune => {
                        return m(Letter, {rune: rune})
                    }),
                ]
            }),
        ])
    },
}

document.body.style.margin = 0
m.mount(document.body, Page)
