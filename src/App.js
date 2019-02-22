import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Modal from 'react-modal';
import DatePicker, { registerLocale } from 'react-datepicker';
import pt from 'date-fns/locale/pt';
import 'react-datepicker/dist/react-datepicker.css';
import Creatable from 'react-select/lib/Creatable';
import MaskedInput from 'react-text-mask';

registerLocale('pt', pt);

const selectTheme = (theme) => ({
  ...theme,
  borderRadius: 0,
  colors: {
    ...theme.colors,
    primary25: '#ffc300',
    primary: 'gray',
  },
});

Modal.setAppElement('#root');

class App extends Component {
  constructor (props) {
    super(props);

    this.pickModalToOpen = this.pickModalToOpen.bind(this);
    this.openLoginModal = this.openLoginModal.bind(this);
    this.openAddScoreModal = this.openAddScoreModal.bind(this);
    this.closeLoginModal = this.closeLoginModal.bind(this);
    this.closeAddScoreModal = this.closeAddScoreModal.bind(this);

    this.state = {
      authorized: false,
      loginModalOpen: false,
      addModalOpen: false,
      addForm: {
        date: new Date(),
        games: [],
      },
      inputs: {
        password: '',
      },
      validations: {
        password: true,
      },
      games: [],
      players: [],
      gammeResults: [],
      incId: 0, // list keys for items without ids - https://reactjs.org/docs/lists-and-keys.html
    };
  }

  componentDidMount () {
    let checkAuth = fetch('/api/auth/check', {
      method: 'get',
    }).then(response => {
      if (response.ok) {
        this.setState({
          authorized: true,
        });
      } else {
        this.setState({
          authorized: false,
        });
      }
    });

    Promise.all([checkAuth, this.fetchGames(), this.fetchPlayers(), this.fetchResults()]).then(() => {

    });
  }

  fetchResults () {
    return fetch('/api/participations', {
      method: 'get',
    }).then(response => {
      if (response.ok) {
        response.json().then(result =>
          this.setState({
            gameResults: result,
          }),
        );
      } else {
        this.setState({
          gameResults: [],
        });
      }
    });
  }

  fetchPlayers () {
    return fetch('/api/players', {
      method: 'get',
    }).then(response => {
      if (response.ok) {
        response.json().then(result =>
          this.setState({
            players: result.map(el => {
              el.value = el.id;
              el.label = el.name;
              delete el.id;
              delete el.name;
              return el;
            }),
          }),
        );
      } else {
        this.setState({
          players: [],
        });
      }
    });
  }

  fetchGames () {
    return fetch('/api/games', {
      method: 'get',
    }).then(response => {
      if (response.ok) {
        response.json().then(result =>
          this.setState({
            games: result.map(el => {
              el.value = el.id;
              el.label = el.name;
              delete el.id;
              delete el.name;
              return el;
            }),
          }),
        );
      } else {
        this.setState({
          games: [],
        });
      }
    });
  }

  login () {
    fetch('/api/auth', {
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'post',
      body: JSON.stringify({
        password: this.state.inputs.password,
      }),
    }).then((response) => {
      let validations = { ...this.state.validations };
      let authorized = false;

      if (response.ok) {
        validations.password = true;
        authorized = true;
        this.closeLoginModal();
        this.openAddScoreModal();
      } else {
        validations.password = false;
      }

      this.setState({
        validations: validations,
        authorized: authorized,
      });
    });
  }

  isAuthorized () {
    return this.state.authorized;
  }

  pickModalToOpen () {
    if (this.isAuthorized()) {
      this.openAddScoreModal();
    } else {
      this.openLoginModal();
    }
  }

  handleSubmitScores () {
    this.setState({
      submitting: true,
    });

    fetch('/api/participations', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(this.state.addForm),
    }).then((response) => {
      if (response.ok) {
        this.setState({
          addForm: {
            date: new Date(),
            games: [],
          },
          submitting: false,
        });

        this.closeAddScoreModal();
        this.fetchGames();
        this.fetchPlayers();
        this.fetchResults();
      }
    });
  }

  handleAddScores () {
    let addForm = { ...this.state.addForm };

    addForm.games.push({
      id: null,
      players: [
        {
          id: null,
          won: 0,
          played: 0,
          _listKey: this.state.incId,
        },
      ],
      _listKey: this.state.incId + 1,
    });

    this.setState({
      addForm: addForm,
      incId: this.state.incId + 2,
    });
  }

  handleRemoveScores (index) {
    let addForm = { ...this.state.addForm };

    addForm.games.splice(index, 1);

    this.setState({
      addForm: addForm,
    });
  }

  handleInputChange (event) {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;

    let inputs = { ...this.state.inputs };

    inputs[name] = value;

    this.setState({
      inputs: inputs,
    });
  }

  handleDateChange (date) {
    let addForm = { ...this.state.addForm };
    addForm.date = date;
    this.setState({
      addForm: addForm,
    });
  }

  handleSelectGame (selected, index) {
    let addForm = { ...this.state.addForm };

    addForm.games[index].id = selected.value;

    this.setState({
      addForm: addForm,
    });
  }

  handleSelectPlayer (selected, gameIndex, playerIndex) {
    let addNewPlayer = false;
    let addForm = { ...this.state.addForm };

    if (addForm.games[gameIndex].players[playerIndex].id === null) {
      addNewPlayer = true;
      addForm.games[gameIndex].players[playerIndex].played = 1;

      addForm.games[gameIndex].players.push(
        {
          id: null,
          won: 0,
          played: 0,
          _listKey: this.state.incId,
        },
      );
    }

    addForm.games[gameIndex].players[playerIndex].id = selected.value;

    this.setState({
      addForm: addForm,
      incId: addNewPlayer ? this.state.incId + 1 : this.state.incId,
    });
  }

  handleWonChange (event, gameIndex, playerIndex) {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;

    let addForm = { ...this.state.addForm };
    let player = addForm.games[gameIndex].players[playerIndex];

    if (parseInt(value) > parseInt(player.played)) {
      player.won = player.played;
    } else {
      player.won = value;
    }

    this.setState({
      addForm: addForm,
    });
  }

  handlePlayedChange (event, gameIndex, playerIndex) {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;

    let addForm = { ...this.state.addForm };
    let player = addForm.games[gameIndex].players[playerIndex];

    if (parseInt(player.won) > parseInt(value)) {
      player.won = value;
    }

    player.played = value;

    this.setState({
      addForm: addForm,
    });
  }

  handleRemovePlayer (gameIndex, playerIndex) {
    let addForm = { ...this.state.addForm };

    addForm.games[gameIndex].players.splice(playerIndex, 1);

    this.setState({
      addForm: addForm,
    });
  }

  isGameOptionDisabled (option) {
    let games = this.state.addForm.games;

    for (let i = 0; i < games.length; i++) {
      let game = games[i];

      if (option.value === game.id) {
        return true;
      }
    }

    return false;
  }

  isNameOptionDisabled (option, gameIndex) {
    if (typeof this.state.addForm.games[gameIndex] === 'undefined') { return false; }

    let players = this.state.addForm.games[gameIndex].players;

    for (let i = 0; i < players.length; i++) {
      let player = players[i];

      if (option.value === player.id) {
        return true;
      }
    }

    return false;
  }

  openLoginModal () {
    this.setState({
      loginModalOpen: true,
    });
  }

  openAddScoreModal () {
    this.setState({
      addModalOpen: true,
    });
  }

  closeLoginModal () {
    this.setState({
      loginModalOpen: false,
    });
  }

  closeAddScoreModal () {
    this.setState({
      addModalOpen: false,
    });
  }

  render () {
    let tableHeader = [];

    let results = [];
    let playedGames = [];

    if (typeof this.state.gameResults !== 'undefined') {
      for (let i = 0; i < this.state.gameResults.length; i++) {
        let result = this.state.gameResults[i];
        let games = Object.keys(result.games);

        for (let k = 0; k < games.length; k++) {
          let game = games[k];

          if (playedGames.indexOf(parseInt(game, 10)) === -1) {
            playedGames.push(parseInt(game, 10));
          }
        }
      }

      playedGames.sort((a, b) => { return a - b; });

      playedGames.forEach((el, i) => {
        let game = {};

        for (let k = 0; k < this.state.games.length; k++) {
          if (this.state.games[k].value === el) {
            game = this.state.games[k];
            break;
          }
        }

        tableHeader.push(<th key="i">{game.label}</th>);
      });

      for (let i = 0; i < this.state.gameResults.length; i++) {
        let result = this.state.gameResults[i];

        let resultEl = [
          <td key="0">{i === 0 ? <img className="crown" alt="KotB" src="images/crown.svg" /> : ''}</td>,
          <td key="1">{result.name}</td>,
          <td key="2">{Math.round(result.perc * 100)}%</td>,
        ];

        for (let k = 0; k < playedGames.length; k++) {
          let game = playedGames[k];

          let gameResult = result.games[game];

          if (typeof gameResult !== 'undefined') {
            resultEl.push(<td key={3 + k}>{gameResult.won} / {gameResult.total} <span className="gamePerc">({Math.round(gameResult.won / gameResult.total * 100)}%)</span></td>);
          } else {
            resultEl.push(<td key={3 + k}>—</td>);
          }
        }

        results.push(<tr>{resultEl}</tr>);
      }
    }

    return (
      <div className="App">
        <header className="App-header">
          <img src="images/logo.svg" className="App-logo" alt="Logo" />
          <button className="login button" onClick={this.pickModalToOpen} href="/login">Adicionar <span className="plus">+</span></button>
        </header>
        <div className="App-content">
          <div className="leaderboardContainer">
            <table className="leaderboard">
              <thead>
                <tr>
                  <th></th>
                  <th>Jogador</th>
                  <th></th>
                  {tableHeader}
                </tr>
              </thead>
              <tbody>
                {results}
              </tbody>
            </table>
          </div>

          <Modal
            className="addScoreModal"
            isOpen={this.state.addModalOpen}
            onRequestClose={this.closeAddScoreModal}
            contentLabel="Adicionar resultados"
          >
            <h2>Adicionar resultados</h2>
            <AddGameDataForm
              formValues={this.state.addForm}
              formData={this.state.addForm}
              handleSubmitScores={() => this.handleSubmitScores()}
              handleAddScores={() => this.handleAddScores()}
              handleRemoveScores={index => this.handleRemoveScores(index)}
              handleDateChange={date => this.handleDateChange(date)}
              handleSelectGame={(selected, index) => this.handleSelectGame(selected, index)}
              handleSelectPlayer={(selected, gameIndex, playerIndex) => this.handleSelectPlayer(selected, gameIndex, playerIndex)}
              handlePlayedChange={(event, gameIndex, playerIndex) => this.handlePlayedChange(event, gameIndex, playerIndex)}
              handleWonChange={(event, gameIndex, playerIndex) => this.handleWonChange(event, gameIndex, playerIndex)}
              handleRemovePlayer={(gameIndex, playerIndex) => this.handleRemovePlayer(gameIndex, playerIndex)}
              isGameOptionDisabled={(option) => this.isGameOptionDisabled(option)}
              isNameOptionDisabled={(option, gameIndex) => this.isNameOptionDisabled(option, gameIndex)}
              games={this.state.games}
              players={this.state.players}
              submitting={this.state.submitting}
            >
            </AddGameDataForm>
          </Modal>
          <Modal
            className="loginModal"
            isOpen={this.state.loginModalOpen}
            onRequestClose={this.closeLoginModal}
            contentLabel="Autenticar"
          >
            <h2 className="title">
            </h2>
            <form>
              <label htmlFor="password">Palavra-passe</label><br />
              { !this.state.validations.password ? <span className="validationMessage">Palavra-passe incorreta</span> : '' }
              <input name="password" id="password" type="password" value={this.state.inputs.password} onChange={this.handleInputChange.bind(this)} /><br />
              <button type="button" onClick={this.login.bind(this)} className="button submit">Autenticar</button>
            </form>
          </Modal>
        </div>
      </div>
    );
  }
}

class AddGameDataForm extends Component {
  createButtonDisabled () {
    let disabled = false;
    let games = this.props.formData.games;

    if (this.props.submitting) { return true; }

    if (games.length === 0) {
      return true;
    }

    games.forEach(game => {
      if (game.id === null) { disabled = true; }

      game.players.forEach(player => {
        if (game.players.length === 1 && player.id === null) { disabled = true; }
      });
    });

    return disabled;
  }

  render () {
    let games = this.props.formData.games.map((game, i) => {
      return (
        <div key={game._listKey} className="game">
          <div className="gameHeader">
            <label className="gameLabel">Jogo</label>
            <Creatable
              onChange={value => this.props.handleSelectGame(value, i)}
              options={this.props.games}
              isSearchable={true}
              className="gameSelect"
              theme={selectTheme}
              isOptionDisabled={this.props.isGameOptionDisabled}
            />
            <button type="button" className="button removeGame" onClick={() => this.props.handleRemoveScores(i)}>&times;</button>
          </div>
          <ul className="playerList">
            <h3>Jogadores</h3>
            {
              this.props.formData.games[i].players.map((player, j) => {
                return (
                  <li className="player" key={player._listKey}>
                    <Creatable
                      className="name"
                      multi={false}
                      options={this.props.players}
                      onChange={value => this.props.handleSelectPlayer(value, i, j)}
                      createOptionPosition="last"
                      theme={selectTheme}
                      isOptionDisabled={(option) => this.props.isNameOptionDisabled(option, i)}
                    />
                    <div className="played">
                      <label>Jogados</label>
                      <MaskedInput
                        type="text"
                        mask={[/\d/, /\d/, /\d/]}
                        guide={false}
                        value={this.props.formData.games[i].players[j].played}
                        onChange={(event) => this.props.handlePlayedChange(event, i, j)}
                      />
                    </div>
                    <div className="won">
                      <label>Ganhos</label>
                      <MaskedInput
                        type="text"
                        mask={[/\d/, /\d/, /\d/]}
                        guide={false}
                        value={this.props.formData.games[i].players[j].won}
                        onChange={(event) => this.props.handleWonChange(event, i, j)}
                      />
                    </div>
                    <div className="actions">
                      {this.props.formData.games[i].players[j].id !== null ? <button type="button" className="button removeGame" onClick={() => this.props.handleRemovePlayer(i, j)}>&times;</button> : ''}
                    </div>
                  </li>
                );
              })
            }
          </ul>
        </div>
      );
    });

    return (
      <form autoComplete="off">
        <div className="resultsHeader">
          <label className="dateLabel" htmlFor="date">Data</label>
          <DatePicker
            className="date"
            selected={this.props.formData.date}
            onChange={this.props.handleDateChange}
            locale='pt'
            dateFormat='dd/MM/yyyy'
          />
          <button type="button" onClick={this.props.handleAddScores} className="button addGame">Jogo <span className="plus">+</span></button>
        </div>
        <div className="gamesList">
          {games}
        </div>
        <div className="resultsFooter">
          <button type="button" disabled={this.createButtonDisabled()} onClick={this.props.handleSubmitScores} className="button submit">Guardar <span role="img" aria-label="checkmark">✔️</span></button>
        </div>
      </form>
    );
  }
}

AddGameDataForm.propTypes = {
  formData: PropTypes.object,
  handleSelectGame: PropTypes.func,
  handleSelectPlayer: PropTypes.func,
  handleRemoveScores: PropTypes.func,
  handlePlayedChange: PropTypes.func,
  handleAddScores: PropTypes.func,
  handleSubmitScores: PropTypes.func,
  handleWonChange: PropTypes.func,
  handleDateChange: PropTypes.func,
  handleRemovePlayer: PropTypes.func,
  games: PropTypes.array,
  isGameOptionDisabled: PropTypes.bool,
  players: PropTypes.array,
  isNameOptionDisabled: PropTypes.func,
  submitting: PropTypes.bool,
};

export default App;
