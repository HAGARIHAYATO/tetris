import _ from "lodash"
import axios from "axios";
import Tetris from "./tetris"
const btn = document.querySelector(".sBtn");
const textInput = document.querySelector("#text-input");
const ranking = document.querySelector(".rank-wrapper");
btn.addEventListener("click", ()=>{
	new Tetris(document.querySelector("#canvas"))
	console.log(textInput.value)
})
axios.get('https://script.google.com/macros/s/AKfycbxMD3fp3dI2t5zcISbMub_n6-85zctMAcQrelKeDJKy4YvpGNo/exec')
    .then(function (response) {
      // handle success
      console.log(response.data);
      for(let i = 0; i <= response.data.length; i++){
      	ranking.innerHTML += ('<div class="rank-content"><p>name:'
      	+ response.data[i].name + '</p><p>score:<span class="score-point">' + response.data[i].score +'</span></p></div>')
      }
    })
    .catch(function (error) {
      // handle error

    })
    .finally(function () {
      // always executed
    });

