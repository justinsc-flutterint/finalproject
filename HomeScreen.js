import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

function HomeScreen({ navigation }) {
  const [modalVisible, setModalVisible] = useState(false);
  // Set difficulty params
  const openGameScreen = (level) => {
    let timer = 60; // Default for hard level
    if (level === 'easy') timer = 120;
    else if (level === 'medium') timer = 90;

    navigation.navigate('Game', { difficulty: { level, timer } });
  };
  // Screen components
  return (
    <View style={styles.container}>

      <TouchableOpacity style={[styles.button, styles.buttonEasy]} onPress={() => openGameScreen('easy')}>
        <Text style={styles.textStyle}>Easy</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, styles.buttonMedium]} onPress={() => openGameScreen('medium')}>
        <Text style={styles.textStyle}>Medium</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, styles.buttonHard]} onPress={() => openGameScreen('hard')}>
        <Text style={styles.textStyle}>Hard</Text>
      </TouchableOpacity>

      <View style={styles.bannerButton}>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Text style={styles.bannerButtonText}>How To Play</Text>
        </TouchableOpacity>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTextTitle}>How to Play</Text>
            <Text style={styles.modalText}>Solve the scrambled word to earn points</Text>
            <Text style={styles.modalText}>The faster you get it right, the more points you get</Text>
            <Text style={styles.modalText}>Improve your skills and reach new high scores</Text>
            <TouchableOpacity
              style={[styles.button, styles.buttonClose]}
              onPress={() => setModalVisible(!modalVisible)}>
              <TouchableOpacity style={[styles.button, styles.buttonHard]} onPress={() => setModalVisible(!modalVisible)}>
                <Text style={styles.textStyle}>Close</Text>
              </TouchableOpacity>
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
    backgroundColor: '#BE6F36'
  },
  button: {
    width: width * 0.8,
    borderRadius: 25,
    paddingVertical: height * 0.02,
    elevation: 2,
    justifyContent: 'center',
    marginBottom: 20,
  },
  buttonEasy: {
    backgroundColor: '#2BA600',
  },
  buttonMedium: {
    backgroundColor: '#CCB800',
  },
  buttonHard: {
    backgroundColor: '#CF0000',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: width * 0.07,
  },
  modalView: {
    margin: 30,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
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
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: width * 0.05,
    fontweight: 'bold',
  },
  modalTextTitle: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: width * 0.1,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  bannerButton: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    padding: 15,
    backgroundColor: '#335381',
  },
  bannerButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 20,
    textAlign: 'center',
  },
});

export default HomeScreen;
