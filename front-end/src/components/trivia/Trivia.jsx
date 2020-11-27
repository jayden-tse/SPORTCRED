import React from 'react';
import { Typography } from '@material-ui/core';
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import TriviaStart from './TriviaStart';
import TriviaGame from './TriviaGame';
import TriviaResults from './TriviaResults';
import LoadingScreen from '../general/LoadingScreen';
import {get10TriviaQuestions, updateACS} from '../../api/TriviaCalls.js';

const theme = createMuiTheme({
  palette: {
    type: 'dark',
    primary: {
      main: '#86C232'
    },
    secondary: {
      main: '#FFA722'
    }
  }
});

/**
 * The Trivia game. Handles the game state and displays the corresponding
 * components to the state.
 */
class Trivia extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      // The current game state.
      state: 'start',
      // The questions (question objects) for the trivia game.
      // Needs to be loaded from the backend
      questions: [],
      // The player's answer to each question. Filled after all questions are
      // answered
      results: [],
      // The player's ACS score.
      score: ''
    };
    this.loadSolo = this.loadSolo.bind(this);
    this.loadHeadToHead = this.loadHeadToHead.bind(this);
    this.handleTriviaComplete = this.handleTriviaComplete.bind(this);
    this.handlePlayAgain = this.handlePlayAgain.bind(this);
    this.reset = this.reset.bind(this);
  }
  
  loadSolo() {
    console.log('Loading Solo Trivia');
    this.setState({state: 'load'});
    // make async call to get the 10 questions and store it in state
    // and after that's done update the game state to trivia
    get10TriviaQuestions().then(async (res)=>{
        if(typeof res !== 'undefined' && res.ok){
            const questions = await res.json();
            this.setState({state: 'trivia', questions: questions});
        } else {
            throw new Error("Bad Response From Backend");
        }
    }).catch((error)=>{
        console.log(`Error Loading Trivia Questions: ${error}`)
        this.setState({state: 'start'});
    });
  }

  // Disabled for now
  loadHeadToHead() {
    // console.log('Loading Head to Head Trivia');
    // this.setState({state: 'load'});
  }

  handleTriviaComplete(results) {
    // TODO: send results to server to update ACS
    console.log('Trivia complete. Results: ' + results);
    this.setState({state: 'results', results: results});
    // Update the user's ACS score in the backend based on
    // the results and store it into the state.
    updateACS(results).then(async (res)=>{
      // console.log(res);
      if(typeof res !== 'undefined' && res.ok){
          const score = await res.json();
          this.setState({state: 'results', score: score.score});
          // console.log(this.state);
      } else {
          throw new Error("Bad Response From Backend");
      }
    }).catch((error)=>{
      console.log(`Error Updating ACS: ${error}`)
      this.setState({state: 'start'});
    });
  }

  // After finishing a trivia game, load another one
  handlePlayAgain() {
    // Clear previous questions and answers
    this.setState({questions: [], results: []});
    this.loadSolo();
  }

  // Reset state to initial state (goes back to start)
  reset() {
    this.setState({state: 'start', questions: [], results: [], score: ''});
  }
  
  render() {
    let content = null;
    switch (this.state.state) {
      case 'start':
        content = (
          <TriviaStart
            onSolo={this.loadSolo}
            onHeadToHead={this.loadHeadToHead}
          />
        );
        break;
      case 'load':
        content = <LoadingScreen text='Starting Trivia...'/>
        break;
      case 'trivia':
        content = (
          <TriviaGame
            triviaQuestions={this.state.questions}
            previewTimer={3}
            answerTimer={14}
            onFinish={this.handleTriviaComplete}
          />
        );
        break;
      case 'results':
        content = (
          <TriviaResults
            results={this.state.results}
            onPlayAgain={this.handlePlayAgain}
            onMainMenu={this.reset}
          />
        );
        break;
      default:
        content = (
          <Typography variant="body1">
            There was a problem in the game state. State '{this.state.state}'
            is not recognized.
          </Typography>
        );
    }
    return (
      <ThemeProvider theme={theme}>{content}</ThemeProvider>
    );
  }
}

export default Trivia;
