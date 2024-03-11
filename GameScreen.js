import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Alert, Modal, TouchableOpacity, Dimensions  } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

const { width} = Dimensions.get('window');

export default function GameScreen({ navigation, route }) {
  //initialize useState hooks
  const { difficulty } = route.params;
  const [currentWord, setCurrentWord] = useState('');
  const [scrambledWord, setScrambledWord] = useState('');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [timer, setTimer] = useState(difficulty.timer); // Set based on difficulty
  const [wordList, setWordList] = useState([]);
  const [definition, setDefinition] = useState("");
  const [availableLetters, setAvailableLetters] = useState([]);
  const [selectedLetters, setSelectedLetters] = useState([]);
  const [round, setRound] = useState(1); // Starts from round 1
  const [modalVisible, setModalVisible] = useState(false);

  const difficultySettings = {
    easy: { minLength: 4, maxLength: 6, highScoreKey: 'highScoreEasy' },
    medium: { minLength: 5, maxLength: 7, highScoreKey: 'highScoreMedium' },
    hard: { minLength: 6, maxLength: 8, highScoreKey: 'highScoreHard' }
  };
  //Get API key from Secure Store
  async function getApiKey() {
    return await SecureStore.getItemAsync('api_key');
  }
  // Get difficulty-based values
  useEffect(() => {
    loadHighScore(difficultySettings[difficulty.level].highScoreKey);
    fetchWords(difficultySettings[difficulty.level].minLength, difficultySettings[difficulty.level].maxLength);
  }, []);
  // Check if there are more words available
  useEffect(() => {
    if (wordList.length > 0) {
      setNewRound();
    }
  }, [wordList]);
  // Decrease timer
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer(timer - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      endGame();
    }
  }, [timer]);
  // Call API for current word definition
  useEffect(() => {
    fetchDefinition(currentWord);
  }, [currentWord, difficulty.level]);
  // Fetch word definition
  async function fetchDefinition(word) {
    const apiKey = await getApiKey();
    const url = `https://api.wordnik.com/v4/word.json/${word}/definitions?limit=1&includeRelated=false&useCanonical=true&includeTags=false&api_key=${apiKey}`;
    try {
      const response = await fetch(url);
      const json = await response.json();
      if (json.length > 0) {
        let definitionText = json[0].text.replace(/<\/?em>|<\/?xref>|<internalXref urelencoded>|<\/internalXref>/g, ""); //parse and remove tags from JSON text
        setDefinition(definitionText); // Update the definition state with the cleaned definition
      }
    } catch (error) {
      console.error('Error fetching definition:', error);
      setDefinition("Definition not available.");
    }
  }
  // Fetch word list
  const fetchWords = async (minLength, maxLength) => {
    try {
      const apiKey = await getApiKey();
      const response = await fetch(`https://api.wordnik.com/v4/words.json/randomWords?hasDictionaryDef=true&includePartOfSpeech=noun,adjective,verb,adverb,interjection&excludePartOfSpeech=abbreviation,affix,conjunction,idiom,proper-noun,suffix,past-participle&maxCorpusCount=-1&minDictionaryCount=1&maxDictionaryCount=-1&minLength=${minLength}&maxLength=${maxLength}&limit=100&api_key=${apiKey}`);
      const words = await response.json();
      const filteredWords = words
        .filter(word => !word.word.includes('-'))
        .map(word => word.word)
        .sort((a, b) => a.length - b.length); // Sort words by length
      setWordList(filteredWords);
    } catch (error) {
      console.error('Failed to fetch words:', error);
    }
  };
  // Get the high score
  const loadHighScore = async (key) => {
    try {
      const storedHighScore = await AsyncStorage.getItem(key);
      if (storedHighScore) setHighScore(parseInt(storedHighScore));
    } catch (e) {
      console.log(e);
    }
  };
  // Save the high score in asyn storage
  const saveHighScore = async (newHighScore, key) => {
    try {
      await AsyncStorage.setItem(key, newHighScore.toString());
    } catch (e) {
      console.log(e);
    }
  };
  // Scramble the fetched word
  const scrambleWord = (word) => {
    let letters = word.split('');
    for (let i = letters.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [letters[i], letters[j]] = [letters[j], letters[i]];
    }
    return letters.join('');
  };

  const handleLetterSelect = (letter) => {
    const index = availableLetters.findIndex((l) => l === letter);
    if (index > -1) {
      // Remove the first instance of the letter
      setAvailableLetters([...availableLetters.slice(0, index), ...availableLetters.slice(index + 1)]);
    }
    const newSelectedLetters = [...selectedLetters, letter];
    setSelectedLetters(newSelectedLetters);

    // Check if the length matches and call checkAnswer if it does
    if (newSelectedLetters.length === currentWord.length) {
      const userGuess = newSelectedLetters.join('').toLowerCase();
      checkAnswer(userGuess); // This function needs to be defined to check the guess
    }
  };

  // Function to reset the guess
  const resetGuess = () => {
    setAvailableLetters(scrambledWord.split('').sort());
    setSelectedLetters([]);
  };

  // Reset round and useStates
  const setNewRound = () => {
    if (wordList.length > 0) {
      const word = wordList.shift(); // Remove the first word from the list
      setCurrentWord(word);
      const scrambled = scrambleWord(word);
      setScrambledWord(scrambled);
      setAvailableLetters(scrambled.split('').sort()); // Sort letters alphabetically
      setSelectedLetters([]);
      setTimer(difficulty.timer); // Reset timer for the new round
      setWordList(wordList); // Update the word list state
    } else {
      Alert.alert("Easter egg: you beat the game!"); //If word list is exhausted show easter egg
    }
  };

  const checkAnswer = (userGuess) => {
    console.log(userGuess);
    if (userGuess === currentWord.toLowerCase()) {
      // Define a multiplier based on the remaining time
      // Calculate the time left multiplier
      const timeLeftMultiplier = Math.ceil(timer / (difficulty.timer / 2) * 100) / 100;

      // Use toFixed to round up to 2 decimal points and convert back to a number
      const roundedMultiplier = Number(timeLeftMultiplier.toFixed(2));

      // Calculate points earned with the rounded multiplier
      const pointsEarned = 100 * roundedMultiplier;

      // Update score with the points earned
      setScore(score + pointsEarned);

      // Check and update the high score if necessary
      const newHighScore = score + pointsEarned > highScore ? score + pointsEarned : highScore;
      setHighScore(newHighScore);
      saveHighScore(newHighScore);

      setRound(round + 1)

      setNewRound();
    } else {
      resetGuess();
      Alert.alert('Wrong Answer', 'Try again!', [{ text: 'OK' }]);
    }
  };


  const endGame = () => {
    setModalVisible(true);
  };

  const restartGame = () => {
    setScore(0);
    setRound(1);
    setModalVisible(false);
    setNewRound();
  };

  const quitGame = () => {
    navigation.navigate('Home'); 
    setModalVisible(false); 
  };

  return (
    <View style={styles.container}>
        <Text style={styles.timerCounter}>{timer}</Text>
        <Text style={styles.roundCounter}>Round: {round}</Text>
        <Text style={styles.scrambledWord}>{scrambledWord}</Text>
        <Text style={styles.definitionText}>{definition}</Text>
        <View style={styles.lettersContainer}>
          {availableLetters.map((letter, index) => (
            <TouchableOpacity key={index} style={styles.button} onPress={() => handleLetterSelect(letter)}>
              <Text style={styles.letterbuttonTextStyle}>{letter.toUpperCase()}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.guess}>
          {selectedLetters.join('').toUpperCase()}
        </Text>
        <TouchableOpacity style={styles.buttonReset} onPress={resetGuess}>
          <Text style={styles.resetText}>Reset</Text>
        </TouchableOpacity>
        <View style={styles.scoreBanner}>
          <Text style={styles.scoreText}>Score: {score}</Text>
          <Text style={styles.scoreText}>High Score: {highScore}</Text>
        </View>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(!modalVisible)}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
          <Text style={styles.modaltextStyle}>Time's up!</Text>
            <Text style={styles.modaltextStyle}>The correct word was: {currentWord}</Text>
            {score === highScore && score != 0 &&(
            <Text style={styles.modaltextStyle}>NEW High Score: {highScore}</Text>
            )}
            <TouchableOpacity style={[styles.buttonRetry]} onPress={restartGame}>
              <Text style={styles.modalButtonText}>Retry</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.buttonQuit]} onPress={quitGame}>
              <Text style={styles.modalButtonText}>Quit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#BE6F36',
  },
  letterselectStyle: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 20,
    textAlign: 'center',
  },
  button: {
    borderRadius: 25,
    backgroundColor: '#335381',
    marginBottom: 20,
    marginLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  letterbuttonTextStyle: {
    fontSize: 25,
    margin: 20,
    color: 'white',
    fontWeight: 'bold',
  },
  buttonRetry: {
    backgroundColor: '#2BA600',
    width: '80%',
    padding: 15,
    borderRadius: 25
  },
  buttonQuit: {
    backgroundColor: '#CF0000',
    marginTop: 10,
    width: '80%',
    padding: 15,
    borderRadius: 25
  },
  buttonReset: {
    backgroundColor: '#CF0000',
    width: width * 0.8,
    elevation: 2,
    justifyContent: 'center',
    borderRadius: 25,
  },
  resetText: {
    color: 'white',
    fontSize: width * 0.1,
    textAlign: 'center',
  },
  scrambledWord: {
    fontSize: width * 0.2,
    color: 'white',
    marginBottom: 20,
    textTransform: 'uppercase',
    letterSpacing: 5
  },
  definitionText: {
    margin: 10,
    fontSize: 16,
    textAlign: 'center',
    color: 'white',
  },
  lettersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    margin: 20,
  },
  guess: {
    fontSize: 42,
    margin: 20,
    color: 'white',
    fontWeight: 'bold',
  },
  roundCounter: {
    position: 'absolute',
    top: 80,
    alignSelf: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  timerCounter: {
    position: 'absolute',
    top: 40, 
    alignSelf: 'center',
    fontSize: 30,
    fontWeight: 'bold',
    color: 'white',
  },
  scoreBanner: {
    position: 'absolute',
    bottom: 0,
    backgroundColor: '#335381',
    width: '100%',
    padding: 15,
  },
  scoreText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 20,
    textAlign: 'center',
  },
  modaltextStyle: {
    color: 'black',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: width * 0.07,
    marginBottom: 20,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalButtonText: {
    color: 'black',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: width * 0.07,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
});