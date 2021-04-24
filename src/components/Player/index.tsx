import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { usePlayer } from '../../contexts/PlayerContext';
import Slider from 'rc-slider';

import 'rc-slider/assets/index.css';
import styles from './styles.module.scss';
import { convertDurationToTimeString } from '../../utils/convertDurationToTimeString';

export function Player() {
	const audioRef = useRef<HTMLAudioElement>(null);

	const [progress, setProgress] = useState(0);

	const {
		episodeList,
		currentEpisodeIndex,
		isPlaying,
		isLooping,
		isShuffling,
		playNext,
		playPrevious,
		hasNext,
		hasPrevious,
		togglePlay,
		toggleLoop,
		toggleShuffle,
		setPlayingState,
		clearPlayerState
	} = usePlayer();

	useEffect(
		() => {
			if (!audioRef.current) {
				return;
			}

			if (isPlaying) {
				audioRef.current.play();
			} else {
				audioRef.current.pause();
			}
		},
		[ isPlaying ]
	);


	//Retornando tempo atual do Player
	function setupProgressListener(){
		audioRef.current.currentTime = 0;

		audioRef.current.addEventListener('timeupdate', () => {
			setProgress(Math.floor(audioRef.current.currentTime));
		});
	}

	//Ativando modo Shuffle
	function handleEpisodeEnded(){
		if(hasNext){
			playNext()
		} else {
			clearPlayerState()
		}
	}

	//Reposicionando Slider com mouse
	function handleSeek(amount: number){
		audioRef.current.currentTime = amount;
		setProgress(amount);
	}

	const episode = episodeList[currentEpisodeIndex];

	return (
		<div className={styles.playerContainer} >
			<header>
				<img src="/playing.svg" alt="play now" />
				<strong>Tocando agora</strong>
			</header>

			{episode ? (
				<div className={styles.currentEpisode}>
					<Image width={592} height={592} src={episode.thumbnail} objectFit="cover" />
					<strong>{episode.title}</strong>
					<span>{episode.members}</span>
				</div>
			) : (
				<div className={styles.emptyPlayer}>
					<strong>Selecione um podcast para ouvir</strong>
				</div>
			)}

			<footer className={!episode ? styles.empty : ''}>
				<div className={styles.progress}>
					<span>{convertDurationToTimeString(progress)}</span>
					<div className={styles.slider}>
						{episode ? (
							<Slider
								max={episode.duration}
								value={progress}
								onChange={handleSeek}
								trackStyle={{ backgroundColor: '#01f816' }}
								railStyle={{ backgroundColor: '#a582f5' }}
								handleStyle={{ borderColor: '#01f816', borderWidth: 4 }}
							/>
						) : (
							<div className={styles.emptySlider} />
						)}
					</div>
					<span>{convertDurationToTimeString(episode?.duration ?? 0)}</span>
				</div>

				{episode && (
					<audio
						src={episode.url}
						ref={audioRef}
						autoPlay
						loop={isLooping}
						onEnded={handleEpisodeEnded}
						onPlay={() => setPlayingState(true)}
						onPause={() => setPlayingState(false)}
						onLoadedMetadata={setupProgressListener}
					/>
				)}

				<div className={styles.buttons}>
					<button
						type="button"
						disabled={!episode || episodeList.length == 1 || isLooping}
						onClick={toggleShuffle}
						className={isShuffling ? styles.isActive : ''}
					>
						<img src="/shuffle.svg" alt="Shuffle" />
					</button>
					<button type="button" disabled={!episode || !hasPrevious} onClick={playPrevious}>
						<img src="/play-previous.svg" alt="Previous song" />
					</button>
					<button type="button" className={styles.playButton} disabled={!episode} onClick={togglePlay}>
						{isPlaying ? <img src="/pause.svg" alt="Pause" /> : <img src="/play.svg" alt="Play" />}
					</button>
					<button type="button" disabled={!episode || !hasNext} onClick={playNext}>
						<img src="/play-next.svg" alt="Next song" />
					</button>
					<button
						type="button"
						disabled={!episode || isShuffling}
						onClick={toggleLoop}
						className={isLooping ? styles.isActive : ''} /* Alterando a cor do botão */
					>
						<img src="/repeat.svg" alt="Repeat" />
					</button>
				</div>
			</footer>
		</div>
	);
}
