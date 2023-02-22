function Gameboard() {
  const rows = 3;
  const columns = 3;
  let board = [];

  function setupBoard() {
    board = [];
    for (let i = 0; i < rows; i++) {
      board[i] = [];
      for (let y = 0; y < columns; y++) {
        board[i].push(Cell());
      }
    }
  }

  const getBoard = () => board;

  const getRawValues = () => {
    return board.map(row => row.map(cell => cell.getMark())).flat();
  };

  function markField(cell, player) {
    if (cell.getMark() !== null) {
      return false;
    }
    cell.addMark(player.getMark());
    return true;
  }

  setupBoard();

  return {
    setupBoard,
    getBoard,
    markField,
    getRawValues
  };
}

function Cell() {
  let mark = null;
  const getMark = () => mark;
  const addMark = newMark => (mark = newMark);
  return {
    getMark,
    addMark
  };
}

function Player(name, mark) {
  setName = n => (name = n);
  getName = () => name;
  getMark = () => mark;
  return {
    setName,
    getName,
    getMark
  };
}

function GameController(nameOne, nameTwo) {
  const board = Gameboard();
  const players = [Player('Player One', 'X'), Player('Player Two', 'O')];
  let activePlayer = players[0];
  const getActivePlayer = () => activePlayer;

  const setNames = (nameOne, nameTwo) => {
    console.log(nameOne, nameTwo);
    players[0].setName(nameOne);
    console.log(players[0].getName());
    players[1].setName(nameTwo);
  };

  const isGameOver = () => {
    let status = 'not over';
    let mark = getActivePlayer().getMark();
    let values = board.getRawValues();
    let winningCells;
    const winningCombinations = [
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
      [1, 4, 7],
      [2, 5, 8],
      [3, 6, 9],
      [1, 5, 9],
      [3, 5, 7]
    ];
    for (let i = 0; i < winningCombinations.length; i++) {
      let arr = winningCombinations[i];
      if (
        values[arr[0] - 1] === mark &&
        values[arr[1] - 1] === mark &&
        values[arr[2] - 1] === mark
      ) {
        status = 'win';
        winningCells = arr;
      }
    }
    if (status === 'not over' && values.every(val => val !== null)) {
      console.log('draw');
      status = 'draw';
    }
    return [status, winningCells];
  };

  const switchActivePlayer = () => {
    activePlayer = activePlayer === players[0] ? players[1] : players[0];
  };

  function playRound(x, y) {
    const cell = board.getBoard()[x][y];
    const validMove = board.markField(cell, getActivePlayer());
    if (!validMove) {
      return false;
    }
    const gameoverData = isGameOver();
    console.log(gameoverData[0]);
    if (gameoverData[0] !== 'not over') {
      return gameoverData[0] === 'draw' ? 'draw' : gameoverData[1];
    }
    switchActivePlayer();
    return false;
  }

  function restartGame() {
    activePlayer = players[0];
    board.setupBoard();
  }

  return {
    restartGame,
    setNames,
    getBoard: board.getBoard,
    getActivePlayer,
    playRound
  };
}

function DisplayController() {
  const modal = document.querySelector('.modal');
  const form = document.querySelector('form');
  const boardDiv = document.querySelector('.board');
  const turnDiv = document.querySelector('.turn');
  const Game = GameController();
  const restartButton = document.querySelector('.button-restart');

  function updateBoard() {
    boardDiv.textContent = '';
    const board = Game.getBoard();
    const activePlayer = Game.getActivePlayer();
    turnDiv.textContent = `${activePlayer.getName()}'s turn`;
    board.forEach((row, rowIndex) => {
      row.forEach((cell, columnIndex) => {
        const button = document.createElement('button');
        button.dataset.column = columnIndex;
        button.dataset.row = rowIndex;
        const value = cell.getMark();
        if (value) {
          button.textContent = value;
        }
        boardDiv.appendChild(button);
      });
    });
  }

  const boardListener = e => {
    e.preventDefault();
    const cellHTML = e.target;
    if (!cellHTML.dataset.column) {
      return;
    }
    const gameOver = Game.playRound(
      cellHTML.dataset.row,
      cellHTML.dataset.column
    );
    updateBoard();
    if (gameOver) {
      if (gameOver === 'draw') {
        console.log('check');
        turnDiv.textContent = `Draw`;
      } else {
        gameOver.forEach(num => {
          document.querySelector(
            `.board :nth-child(${num})`
          ).style.backgroundColor = 'green';
        });
        turnDiv.textContent = `${Game.getActivePlayer().getName()} won!`;
      }
      boardDiv.removeEventListener('click', boardListener);
      restartButton.classList.remove('hide');
    }
  };

  function initGame() {
    form.addEventListener('submit', formListener);
    boardDiv.addEventListener('click', boardListener);
    restartButton.addEventListener('click', e => {
      Game.restartGame();
      updateBoard();
      boardDiv.addEventListener('click', boardListener);
      restartButton.classList.add('hide');
    });
  }

  function formListener(e) {
    e.preventDefault();
    const playerOneName = form.querySelector('#first-name').value;
    const playerTwoName = form.querySelector('#second-name').value;
    Game.setNames(playerOneName, playerTwoName);
    modal.style.display = 'none';
    updateBoard();
  }

  initGame();
}

DisplayController();
