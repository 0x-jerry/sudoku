const utils = {
  /**
   *
   * @param {number[]} arr
   */
  random(arr) {
    const idx = ~~(Math.random() * arr.length)

    return arr[idx] || 0
  },
  /**
   *
   * @param {number[]} arr
   */
  disorderArray(arr) {
    arr = arr.slice()
    const rest = []

    while (arr.length) {
      const idx = ~~(Math.random() * arr.length)
      rest.push(arr.splice(idx, 1)[0])
    }

    return rest
  }
}

class Sudoku {
  /**
   * ```
   * 6 4 2 | 9 7 8 | 5 1 3  |
   * 5 1 3 | 6 4 2 | 9 7 8  |<-- unit = 3 => count = unit * unit = 9
   * 7 8 9 | 5 3 1 | 4 6 2  |
   * ---------------------
   * 4 6 1 | 7 9 3 | 8 2 5
   * 9 2 7 | 8 6 5 | 3 4 1
   * 8 3 5 | 2 1 4 | 7 9 6
   * ---------------------
   * 3 9 6 | 1 8 7 | 2 5 4
   * 2 7 4 | 3 5 6 | 1 8 9
   * 1 5 8 | 4 2 9 | 6 3 7
   * ```
   *
   * @param {number?} unit default is 3
   */
  constructor(unit) {
    this.reset(unit)
  }

  /**
   *
   * @param {number?} unit
   */
  reset(unit) {
    this.debugInfo = {}
    this.unit = unit || this.unit || 3
    this.count = Math.pow(this.unit, 2)

    this.pool = new Array(this.count).fill(0).map((_, i) => i + 1)
    // this.origin = new Array(this.count * this.count).fill(0)
    this.clear()

    /**
     * Every 3x3 box start position
     */
    this.boxPosMap = {}

    for (let i = 0; i < this.count; i++) {
      const x = (i % this.unit) * this.unit
      const y = ~~(i / this.unit) * this.unit
      this.boxPosMap[i] = [x, y]
    }
  }

  clear() {
    this.debugInfo = {}
    /**
     * @type {number[]}
     */
    this.origin = new Array(this.count * this.count).fill(0)
  }

  /**
   *
   * @param {number} x
   * @param {number} y
   * @param {number} value
   */
  set(x, y, value) {
    const pos = y * this.count + x
    this.origin[pos] = value
  }

  /**
   *
   * @param {number} pos
   */
  num2Pos(pos) {
    const y = ~~(pos / this.count)
    const x = pos % this.count
    return [x, y]
  }

  /**
   *
   * @param {number} x
   * @param {number} y
   */
  get(x, y) {
    const pos = y * this.count + x
    return this.origin[pos]
  }

  /**
   *
   * @param {number} y
   */
  getRow(y) {
    const pos = y * this.count
    return this.origin.slice(pos, pos + this.count)
  }

  /**
   *
   * @param {number} x
   */
  getColumn(x) {
    const arr = []
    for (let y = 0; y < this.count; y++) {
      arr.push(this.get(x, y))
    }

    return arr
  }

  /**
   *
   * @param {number} num
   */
  getBox(num) {
    const [startX, startY] = this.boxPosMap[num]

    const arr = []

    for (let y = startY; y < startY + this.unit; y++) {
      for (let x = startX; x < startX + this.unit; x++) {
        const value = this.get(x, y)
        if (value) {
          arr.push(value)
        }
      }
    }

    return arr
  }

  /**
   *
   * @param {number} x
   * @param {number} y
   */
  getBoxByPos(x, y) {
    const num = this.getBoxNumber(x, y)
    return this.getBox(num)
  }

  /**
   *
   * @param {number} x
   * @param {number} y
   * @private
   */
  getBoxNumber(x, y) {
    for (const pos in this.boxPosMap) {
      const [startX, startY] = this.boxPosMap[pos]

      if (x >= startX && x < startX + this.unit && y >= startY && y < startY + this.unit) {
        return pos
      }
    }
  }

  /**
   *
   * @param {number} x
   * @param {number} y
   * @private
   */
  getRest(x, y) {
    const rest = this.pool.slice()
    const row = this.getRow(y)
    const column = this.getColumn(x)
    const box = this.getBoxByPos(x, y)

    row
      .concat(column)
      .concat(box)
      .filter((n) => !!n)
      .forEach((val) => {
        const idx = rest.indexOf(val)
        if (idx >= 0) {
          rest.splice(idx, 1)
        }
      })

    return rest
  }

  /**
   * produce 3x3 puzzle
   * @param {number} num
   */
  generateBox(num) {
    const [startX, startY] = this.boxPosMap[num]

    for (let y = startY; y < startY + this.unit; y++) {
      for (let x = startX; x < startX + this.unit; x++) {
        const value = utils.random(this.getRest(x, y))
        this.set(x, y, value)
      }
    }
  }

  /**
   *
   * @param {number} pos
   * @private
   */
  generatePos(pos) {
    this.debugInfo.callGenerate = (this.debugInfo.callGenerate || 1) + 1
    const [x, y] = this.num2Pos(pos)

    if (this.get(x, y)) {
      return this.generatePos(pos + 1)
    }

    if (pos >= this.count * this.count) {
      return true
    }

    const rest = utils.disorderArray(this.getRest(x, y))

    for (const value of rest) {
      this.set(x, y, value)
      if (this.generatePos(pos + 1)) {
        return true
      }
    }

    this.debugInfo.reGeneratePos = (this.debugInfo.reGeneratePos || 1) + 1

    if (this.debugInfo.reGeneratePos > 100000) {
      throw new Error('Regenerate too much times: ' + this.debugInfo.reGeneratePos)
    }

    this.set(x, y, 0)
    return false
  }

  generate() {
    this.clear()

    for (let i = 0; i < this.unit; i++) {
      this.generateBox(i * this.unit + i)
    }

    this.generatePos(0)
  }

  /**
   * A string like
   *
   * 6 0 9 8 3 1 4 7 5
   * 3 8 5 4 2 7 6 1 9
   * 4 1 7 9 6 5 3 2 8
   * 2 3 1 7 4 8 5 9 6
   * 8 0 6 3 1 9 7 4 2
   * 7 9 4 6 5 2 8 3 1
   * 5 4 3 1 9 0 2 8 7
   * 9 7 2 5 8 4 1 6 3
   * 1 6 8 2 7 3 9 5 0
   *
   * unfilled value is `0`
   *
   * @param {string} sudoku
   * @param {number} unit default is 3
   */
  resolve(sudoku, unit = 3) {
    const source = sudoku
      .trim()
      .split(/\s+/g)
      .map((n) => +n)

    const failedNumbers = source.filter((n) => n < 0 || n > this.count)

    if (source.length !== this.count * this.count || failedNumbers.length > 0) {
      throw new Error('It seem not right sudoku string. Wrong numbers: ' + JSON.stringify(failedNumbers))
    }

    this.reset(unit)
    this.origin = source

    this.generatePos(0)
  }

  /**
   *
   * @private
   * @param {number[]} arr
   */
  validateRange(arr) {
    arr = arr.slice()

    for (let i = 1; i <= this.count; i++) {
      const idx = arr.indexOf(i)
      if (idx >= 0) {
        arr.splice(idx, 1)
      } else {
        return false
      }
    }

    return arr.length === 0
  }

  validate() {
    let pass = true

    for (let i = 0; i < this.count; i++) {
      pass = this.validateRange(this.getRow(i))
      if (!pass) {
        return false
      }
      pass = this.validateRange(this.getColumn(i))
      if (!pass) {
        return false
      }
      pass = this.validateRange(this.getBox(i))
      if (!pass) {
        return false
      }
    }

    return true
  }

  toString() {
    const str = []
    const len = this.count.toString().length

    for (let i = 0; i < this.count; i++) {
      if (i % this.unit === 0 && i !== 0) {
        const wholeLen = this.count * len + (this.count - 1) + (this.unit - 1) * 2

        str.push('-'.repeat(wholeLen))
      }

      const rowStr = this.getRow(i).map((n) => n.toString().padStart(len, ' '))

      for (let i = this.unit - 1; i > 0; i--) {
        rowStr.splice(i * this.unit, 0, '|')
      }

      str.push(rowStr.join(' '))
    }
    return str.join('\n')
  }
}

const sudoku = new Sudoku(3)

function generateSudoku() {
  const start = new Date().getTime()
  sudoku.generate()
  const end = new Date().getTime()

  const time = end - start

  console.log(sudoku.toString())
  console.log(sudoku.validate(), time, sudoku.debugInfo)

  document.getElementById('sudoku-code').innerText = sudoku.toString()
  document.getElementById('sudoku-generate').innerText = 'reGenerate: ' + time + 'ms'

  return time
}

document.getElementById('sudoku-generate').onclick = () => generateSudoku()

generateSudoku()

const sudokuStr = `
2 1 0 | 3 5 7 | 9 6 4
0 0 0 | 8 1 2 | 5 0 3
3 0 5 | 9 4 6 | 0 2 1
---------------------
0 3 2 | 6 7 0 | 1 9 5
8 5 7 | 2 9 0 | 4 3 6
6 9 1 | 5 0 4 | 7 8 2
---------------------
1 4 6 | 0 2 9 | 3 5 8
5 2 9 | 1 8 3 | 6 4 7
7 8 3 | 4 6 5 | 0 1 9
`

sudoku.resolve(sudokuStr.replace(/[|-]/g, ''))

console.log('resolve:' + sudokuStr + '=>\n' + sudoku.toString())
console.log(sudoku.validate(), sudoku.debugInfo)
