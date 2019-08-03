import axios from "axios";
import _ from "lodash";
const info = document.querySelector(".info");
const count = document.querySelector("#count");
const point = document.querySelector("#plus");
const textInput = document.querySelector("#text-input");
const ranking = document.querySelector(".rank-wrapper");
console.log(textInput);

const BLOCK_SIZE = 24
const BLOCK_ROWS = 22
const BLOCK_COLS = 12

const SCREEN_WIDTH = BLOCK_SIZE * BLOCK_COLS
const SCREEN_HEIGHT = BLOCK_SIZE * BLOCK_ROWS

const NON_BLOCK = 0
const NORMAL_BLOCK = 1
const WALL = 9
const LOCK_BLOCK = 2

const KEY_LEFT = 37
const KEY_UP = 38
const KEY_RIGHT = 39
const KEY_DOWN = 40
const GAMEOVER = 0


const BLOCK_COLOR = "#00ffff"
const BACK_COLOR = "#f5f5f5"
const WALL_COLOR = "#000000"
const LOCK_COLOR = "#c0c0c0"
let allCount = 0;

const STAGE = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9],
  [9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9],
  [9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9],
  [9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9],
  [9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9],
  [9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9],
  [9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9],
  [9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9],
  [9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9],
  [9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9],
  [9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9],
  [9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9],
  [9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9],
  [9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9],
  [9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9],
  [9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9],
  [9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9],
  [9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9],
  [9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9],
  [9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
]

const	BLOCKS = [
  [
    [0, 0, 0, 0],
    [0, 1, 1, 0],
    [0, 1, 1, 0],
    [0, 0, 0, 0],
 ],
 [
   [0, 0, 1, 0],
   [0, 0, 1, 0],
   [0, 0, 1, 0],
   [0, 0, 1, 0],
 ],
 [
   [0, 0, 1, 0],
   [0, 1, 1, 0],
   [0, 1, 0, 0],
   [0, 0, 0, 0],
 ],
 [
   [0, 1, 0, 0],
   [0, 1, 1, 0],
   [0, 0, 1, 0],
   [0, 0, 0, 0],
 ],
 [
   [0, 0, 0, 0],
   [0, 1, 1, 0],
   [0, 1, 0, 0],
   [0, 1, 0, 0],
 ],
 [
   [0, 0, 0, 0],
   [0, 1, 1, 0],
   [0, 0, 1, 0],
   [0, 0, 1, 0],
 ],
 [
   [0, 0, 0, 0],
   [0, 1, 0, 0],
   [1, 1, 1, 0],
   [0, 0, 0, 0],
 ]
]

export default class Tetris {
  constructor (canvas) {
    canvas.width = SCREEN_WIDTH
    canvas.height = SCREEN_HEIGHT
    this.cxt = canvas.getContext("2d")
    this.x = 0
    this.y = 0
    this.beforeX = 0
    this.beforeY = 0
    this.block = []

    this.stage = _.cloneDeep(STAGE)
    this.createBlock()
    this.updateBlock()

    this.draw()

	const speed = 500
	let lastUpdate = 0
	// 定期実行処理
	this.ticker = (timestamp) => {
	  if (this.mode === GAMEOVER) return
	  this.beforeX = this.x
	  this.beforeY = this.y
	  const diff = timestamp - lastUpdate
	  // 500msごとにy座標をずらして落下させる
	  if (diff > speed) {
	    lastUpdate = timestamp
	    this.clearBlock()
	    this.y++

		if (this.isHit()) {
		    this.y = this.beforeY
		    this.lockBlock()
		    this.deleteLine()
		    this.createBlock()
		    }
	    this.updateBlock()
	    this.draw()
	  }
	  this.draw()
	  requestAnimationFrame(this.ticker)
	}
	requestAnimationFrame(this.ticker)

	window.addEventListener("keydown", (evt) => {
    this.keyHandler(evt)
    })
  }

  draw () {
    for (let row = 0; row < BLOCK_ROWS; row++) {
      for (let col = 0; col < BLOCK_COLS; col++) {
        switch(this.stage[row][col]){
          case NON_BLOCK:
            this.cxt.fillStyle = BACK_COLOR
            break
          case WALL:
             this.cxt.fillStyle = WALL_COLOR
             break
          case NORMAL_BLOCK:
             this.cxt.fillStyle = BLOCK_COLOR
             break
          case LOCK_BLOCK:
             this.cxt.fillStyle = LOCK_COLOR
             break
        }
        this.cxt.fillRect(col * BLOCK_SIZE, row * BLOCK_SIZE, BLOCK_SIZE -1, BLOCK_SIZE - 1)
      }
    }
  }
  createBlock () {
    this.y = this.beforeY = 0
    this.x = this.beforeX = 4

    const num = Math.floor(Math.random()*BLOCKS.length)
    this.block = _.cloneDeep(BLOCKS[num])
    if (this.isHit()) {
    this.mode = GAMEOVER
    info.textContent = "GAMEOVER";
      console.log(allCount);
      axios.post('https://script.google.com/macros/s/AKfycbxMD3fp3dI2t5zcISbMub_n6-85zctMAcQrelKeDJKy4YvpGNo/exec', {
        name: textInput.value,
        score: allCount
        }, {
          headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        })
        .then(response => {
        }).catch(error => {
        });
   }
  }

   updateBlock () {
   	console.log(this.stage)
    for (let row = 0; row < 4; row++){
    	for(let col = 0; col < 4; col++){
    		if (this.block[row][col]) this.stage[row+this.y][col+this.x] = this.block[row][col]
    	}
    }
  }
  clearBlock () {
  	for (let row = 0; row < 4; row++){
    	for(let col = 0; col < 4; col++){
    		if (this.block[row][col]) this.stage[row+this.y][col+this.x] = this.block[0][0]
    	}
    }
  }
  isHit () {
  	for (let row = 0; row < 4; row++){
    	for(let col = 0; col < 4; col++){
    	 	if (this.block[row][col] && this.stage[row+this.y][col+this.x]) return true
    	}
    }
  }
  lockBlock () {
  	for (let row = 0; row < 4; row++){
    	for(let col = 0; col < 4; col++){
    	 	if (this.block[row][col]) this.stage[row+this.y][col+this.x] = LOCK_BLOCK
    	}
    }
  }
  keyHandler (e) {
    this.clearBlock()
    this.beforeX = this.x
    this.beforeY = this.y

    // キーを入力したときに座標を移動
    switch (e.keyCode) {
    	case KEY_LEFT:
    	this.x--
    	break
    	case KEY_RIGHT:
    	this.x++
    	break
    	case KEY_DOWN:
    	this.y++
    	break
    	case KEY_UP:
    	this.rotateBlock()
    	break
    }
    if (this.isHit()) {
		    this.x = this.beforeX
		    this.y = this.beforeY
		    }
	    this.updateBlock()
 }
  rotateBlock () {
	this.clearBlock()

	const beforeBlock = _.cloneDeep(this.block)
	const copy =_.cloneDeep(this.block)
	  // 回転処理
    for (let row = 0; row < 4; row++){
    	    copy[row] 
    	for(let col = 0; col < 4; col++){
		    copy[row][col] = this.block[3-col][row]
    	}
    }
	this.block = copy

	if (this.isHit()) {
	  this.block = beforeBlock
	}
  }

  deleteLine () {
  	for (let row = BLOCK_ROWS -1; row > 0; row--){
 	const cells = _.filter(this.stage[row],(cell) => cell != NON_BLOCK && cell != WALL)
 	if (cells.length === BLOCK_COLS -2){
    	for(let col = 1; col < BLOCK_COLS - 1; col++){
		    this.stage[row][col] = this.stage[row - 1][col]
		    for(let top = row -1; top > 0; top--){
		    	this.stage[top][col] = this.stage[top -1][col]
		    }
    	}
    allCount += 10;
    row++
    }
   }
  count.textContent = allCount;
    if(allCount>=150){
      count.style.color="gold";
    }else if(allCount>=100){
      count.style.color="silver";
    }else if(allCount>=50){
      count.style.color="blue";
    }else{
      count.style.color="black";
    }
  }
}



