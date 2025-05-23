'use strict';

let secretNumber = Math.trunc(Math.random()*20)+1

let score = 20
let highscore = 0

const displayMessage = function(message){
    document.querySelector('.message').textContent = message;
}

const displayScore = function(score){
    document.querySelector('.score').textContent = score
}

document.querySelector('.check').addEventListener('click', function(){
    const guess = Number(document.querySelector('.guess').value)
    if(!guess){
        // document.querySelector('.message').textContent = 'No Number';
        displayMessage('No Number!')
    }
    else if(guess === secretNumber){
        displayMessage('🎉 Correct Number');
        document.querySelector('.number').textContent = secretNumber
        document.querySelector('body').style.backgroundColor = '#60b347'
        document.querySelector('.number').style.width = '30rem'
        
        if(score > highscore){
            highscore = score
            document.querySelector('.highscore').textContent = highscore
        }} 

        else if(guess !== secretNumber){
        if(score > 1 ){
            displayMessage(guess > secretNumber ? 'Guess too high': 'Guess too low')
            score--
            displayScore(score)
            }
            else{
                displayMessage('💥 You lose');
                displayScore(0)
                
            }
    } 
    // else if(guess > secretNumber){
    //     if(score > 1 ){
    //     document.querySelector('.message').textContent = 'Guess too high'
    //     score--
    //     document.querySelector('.score').textContent = score
    //     }
    //     else{
    //         document.querySelector('.message').textContent = '💥 You lose';
    //         document.querySelector('.score').textContent = 0
            
    //     }
    // }else if(guess < secretNumber){
    //     if(score > 1 ){
    //     document.querySelector('.message').textContent = 'Guess too low'
    //     score--
    //     document.querySelector('.score').textContent = score
    //     }
    //     else{
    //         document.querySelector('.message').textContent = '💥 You lose';
    //         document.querySelector('.score').textContent = 0
    //     }
    // }
})

document.querySelector('.again').addEventListener('click', function(){
    score = 20
    secretNumber = Math.trunc(Math.random()*20)+1
    displayMessage('Start guessing...')
    displayScore(score)
    document.querySelector('.number').textContent = '?'
    document.querySelector('.guess').value = ''
    document.querySelector('body').style.backgroundColor = '#222'
    document.querySelector('.number').style.width = '15rem'
})