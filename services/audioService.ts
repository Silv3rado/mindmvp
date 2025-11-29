import { Audio, AVPlaybackStatus } from 'expo-av';
import { Sound } from 'expo-av/build/Audio';

class AudioService {
  private sound: Sound | null = null;
  private isLoaded: boolean = false;

  async initialize() {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
    } catch (error) {
      console.log('Audio mode setup failed:', error);
    }
  }

  async loadAudio(audioUrl: string) {
    try {
      if (this.sound) {
        await this.unload();
      }

      const { sound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { shouldPlay: false, isLooping: true },
        this.onPlaybackStatusUpdate
      );

      this.sound = sound;
      this.isLoaded = true;
      return true;
    } catch (error) {
      console.log('Failed to load audio:', error);
      return false;
    }
  }

  async play() {
    if (this.sound && this.isLoaded) {
      try {
        await this.sound.playAsync();
      } catch (error) {
        console.log('Failed to play:', error);
      }
    }
  }

  async pause() {
    if (this.sound && this.isLoaded) {
      try {
        await this.sound.pauseAsync();
      } catch (error) {
        console.log('Failed to pause:', error);
      }
    }
  }

  async stop() {
    if (this.sound && this.isLoaded) {
      try {
        await this.sound.stopAsync();
      } catch (error) {
        console.log('Failed to stop:', error);
      }
    }
  }

  async setPosition(milliseconds: number) {
    if (this.sound && this.isLoaded) {
      try {
        await this.sound.setPositionAsync(milliseconds);
      } catch (error) {
        console.log('Failed to set position:', error);
      }
    }
  }

  async getStatus(): Promise<AVPlaybackStatus | null> {
    if (this.sound && this.isLoaded) {
      try {
        return await this.sound.getStatusAsync();
      } catch (error) {
        console.log('Failed to get status:', error);
        return null;
      }
    }
    return null;
  }

  async unload() {
    if (this.sound) {
      try {
        await this.sound.unloadAsync();
        this.sound = null;
        this.isLoaded = false;
      } catch (error) {
        console.log('Failed to unload:', error);
      }
    }
  }

  private onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      // Can be used for tracking playback progress
    }
  };
}

export const audioService = new AudioService();
