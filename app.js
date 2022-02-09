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
    const nbsp = m.trust('&nbsp;')
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
                vnode.attrs.rune || nbsp,
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

function Game() {
    const minwordlen = 3, biggridw = 8, biggridh = 8, smallgridw = 5, smallgridh = 5
    var gridw, gridh
    var sqsize
    var rows, next, used, prizes, highlight, score, hiscore
    var randfunc, nextfunc, resettime
    const nbsp = m.trust('&nbsp')
    setSize()
    window.addEventListener('resize', setSize)
    window.addEventListener('orientationchange', setSize)
    document.addEventListener('visibilitychange', _ => { restoreBoardState() && m.redraw() })
    function reset() {
        gridw = biggridw
        gridh = biggridh
        board = []
        for (let y=0; y<biggridh; y++) {
            let r = []
            for (let x=0; x<biggridw; x++) {
                r.push(null)
            }
            board.push(r)
        }
        prizes = []
        highlight = {}
        score = 0
        hiscore = window.localStorage.getItem('hiscore') || 0
        var t = new Date()
        t.setHours(0)
        t.setMinutes(0, 0, 0)
        randfunc = mulberry32(t.getTime())
        nextfunc = _ => {
            let c = next
            while (!c || c === next)
                c = letters[Math.floor(randfunc()*letters.length)]
            used++
            return c
        }
        used = 0
        next = nextfunc()
        setSize()
    }
    function autoreset() {
        let t = new Date()
        for (let d=t.getDate(); d==t.getDate(); t=new Date(t.getTime()+3600000));
        t.setHours(0)
        t.setMinutes(0, 0, 0)
        resettime = t
        let diff = t.getTime() - (new Date().getTime())
        window.setTimeout(autoreset, diff)
        if (!restoreBoardState())
            reset()
    }
    return {
        view: vnode => {
            if (!words.righteous) return
            if (!resettime) autoreset()
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
                        if (row >= gridh) return
                        return [
                            m('br'),
                            cols.map((rune, col) => {
                                if (col >= gridw) return
                                let hi = highlight[''+row+','+col]
                                return m(Letter, {
                                    size: sqsize,
                                    rune: rune,
                                    background: hi>1 ? '#050' : (hi ? '#030' : '#000'),
                                    take: _ => {
                                        if (restoreBoardState()) return
                                        if (rune) return
                                        board[row][col] = next
                                        next = nextfunc()
                                        givePrizes(row, col)
                                        saveBoardState()
                                    },
                                })
                            }),
                        ]
                    }),
                ]),
                m('br'),
                gridw>smallgridw && m(Button, {
                    size: sqsize,
                    onclick: e => {
                        e.preventDefault()
                        reset()
                        gridw = smallgridw
                        gridh = smallgridh
                        saveBoardState()
                    },
                }, 'erase & try smaller'),
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
            window.innerWidth / biggridw,
            window.innerHeight / (biggridh + 3)) - 2
        m.redraw()
    }
    function givePrizes(prizeRow, prizeCol) {
        Object.keys(highlight).map(k => {
            highlight[k] = 1
        })
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
                        highlight[''+prizeRow+','+col] = 2
                }
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
                        highlight[''+row+','+prizeCol] = 2
                }
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
    function saveBoardState() {
        window.localStorage.setItem('board', JSON.stringify({
            board: board,
            used: used,
            resettime: resettime.getTime(),
            prizes: prizes,
            highlight: highlight,
            score: score,
            gridw: gridw,
            gridh: gridh,
        }))
    }
    function restoreBoardState() {
        try {
            let saved = JSON.parse(window.localStorage.getItem('board'))
            if (saved.resettime == resettime.getTime() &&
                (!used || saved.used > used || saved.gridw < gridw)) {
                reset()
                for (; used<saved.used; used++)
                    next = nextfunc()
                board = saved.board
                prizes = saved.prizes || []
                highlight = saved.highlight || {}
                score = saved.score || 0
                gridw = saved.gridw || biggridw
                gridh = saved.gridh || biggridh
                return true
            }
        } catch(e) {
        }
        return false
    }
    function mulberry32(a) {
        return function() {
            var t = a += 0x6D2B79F5;
            t = Math.imul(t ^ t >>> 15, t | 1);
            t ^= t + Math.imul(t ^ t >>> 7, t | 61);
            return ((t ^ t >>> 14) >>> 0) / 4294967296;
        }
    }
}

document.body.style.margin = 0
document.body.style.background = '#000'
m.mount(document.body, Game)
