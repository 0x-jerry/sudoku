class Sudoku {
  /**
   *
   * @param {number?} unit
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

    this.poll = new Array(this.count).fill(0).map((_, i) => i + 1)
    // this.origin = new Array(this.count * this.count).fill(0)
    this.clear()

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
  getRange(num) {
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
  getRangeByPos(x, y) {
    const num = this.getRangeNumber(x, y)
    return this.getRange(num)
  }

  /**
   *
   * @param {number} x
   * @param {number} y
   */
  getRangeNumber(x, y) {
    for (const pos in this.boxPosMap) {
      const [startX, startY] = this.boxPosMap[pos]

      if (x >= startX && x < startX + this.unit && y >= startY && y < startY + this.unit) {
        return pos
      }
    }
  }

  /**
   *
   * @param {number[]} arr
   */
  random(arr) {
    const idx = ~~(Math.random() * arr.length)

    return arr[idx] || 0
  }

  /**
   *
   * @param {number[]} arr
   */
  reRandom(arr) {
    arr = arr.slice(0)
    const rest = []

    while (arr.length) {
      const idx = ~~(Math.random() * arr.length)
      rest.push(arr.splice(idx, 1)[0])
    }

    return rest
  }

  /**
   *
   * @param {number} x
   * @param {number} y
   */
  getRest(x, y) {
    const rest = this.poll.slice(0)
    const row = this.getRow(y).filter((n) => !!n)
    const column = this.getColumn(x).filter((n) => !!n)
    const range = this.getRangeByPos(x, y).filter((n) => !!n)

    row
      .concat(column)
      .concat(range)
      .forEach((val) => {
        const idx = rest.indexOf(val)
        if (idx >= 0) {
          rest.splice(idx, 1)
        }
      })

    return rest
  }

  /**
   * origin value Iterator
   * @param {(x:number, y:number, value:number) => void} func
   */
  each(func) {
    for (let y = 0; y < this.count; y++) {
      for (let x = 0; x < this.count; x++) {
        func(x, y, this.get(x, y))
      }
    }
  }

  /**
   * produce 3x3 puzzle
   * @param {number} num
   */
  generateBox(num) {
    const [startX, startY] = this.boxPosMap[num]

    for (let y = startY; y < startY + this.unit; y++) {
      for (let x = startX; x < startX + this.unit; x++) {
        const value = this.random(this.getRest(x, y))
        this.set(x, y, value)
      }
    }
  }

  generate() {
    this.clear()

    const generatePos = (pos) => {
      this.debugInfo.callGenerate = (this.debugInfo.callGenerate || 1) + 1
      const [x, y] = this.num2Pos(pos)

      if (this.get(x, y)) {
        return generatePos(pos + 1)
      }

      if (pos >= this.count * this.count) {
        return true
      }

      const rest = this.reRandom(this.getRest(x, y))

      for (const value of rest) {
        this.set(x, y, value)
        if (generatePos(pos + 1)) {
          return true
        }
        this.set(x, y, 0)
      }

      this.debugInfo.reGeneratePos = (this.debugInfo.reGeneratePos || 1) + 1

      return false
    }

    for (let i = 0; i < this.unit; i++) {
      this.generateBox(i * this.unit + i)
    }

    generatePos(0)
  }

  /**
   *
   * @param {number[]} arr
   */
  validateRange(arr) {
    arr = arr.slice(0)

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
      pass = this.validateRange(this.getRange(i))
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
        str.push('-'.repeat(this.count + this.count + 3))
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

const sudoku = new Sudoku()

function start() {
  const start = new Date().getTime()
  sudoku.generate()
  const end = new Date().getTime()

  const time = end - start

  console.log(sudoku.toString())
  console.log(sudoku.validate(), sudoku.debugInfo)

  document.getElementById('sudoku-code').innerText = sudoku.toString()
  document.getElementById('sudoku-generate').innerText = 'reGenerate: ' + time +'ms'

  return time
}

document.getElementById('sudoku-generate').onclick = () => start()
start()
