import { GetStaticProps } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { api } from '../services/api';
import { convertDurationToTimeString } from '../utils/convertDurationToTimeString';
import { usePlayer } from '../contexts/PlayerContext';

import styles from './home.module.scss';

type Episode = {
	id: string;
	title: string;
	members: string;
	published_at: string;
	thumbnail: string;
	duration: number;
	durationAsString: string;
	url: string;
	publishedAt: string;
};

type HomeProps = {
	lastedEpisodes: Episode[];
	allEpisodes: Episode[];
};

export default function Home({ lastedEpisodes, allEpisodes }: HomeProps) {
	const { playList } = usePlayer();

	const episodeList = [ ...lastedEpisodes, ...allEpisodes ];

	return (
		<div className={styles.homepage}>
			<Head>
				<title>Home | Podcastr </title>
			</Head>

			<section className={styles.latestEpisodes}>
				<h2>Últimos lançamentos</h2>

				<ul>
					{lastedEpisodes.map((episode, index) => {
						return (
							<li key={episode.id}>
								<Image
									width={192}
									height={192}
									src={episode.thumbnail}
									alt={episode.title}
									objectFit="cover"
								/>

								<div className={styles.episodeDetails}>
									<Link href={`/episodes/${episode.id}`}>
										<a>{episode.title}</a>
									</Link>
									<p>{episode.members}</p>
									<span>{episode.publishedAt}</span>
									<span>{episode.durationAsString}</span>
								</div>

								<button type="button" onClick={() => playList(episodeList, index)}>
									<img src="/play-green.svg" alt="Listen Now" />
								</button>
							</li>
						);
					})}
				</ul>
			</section>

			<section className={styles.allEpisodes}>
				<h2>Todos episódios</h2>

				<table cellSpacing={0}>
					<thead>
						<tr>
							<th />
							<th>Podcast</th>
							<th>Integrantes</th>
							<th>Data</th>
							<th>Duração</th>
							<th />
						</tr>
					</thead>
					<tbody>
						{allEpisodes.map((episode, index) => {
							return (
								<tr key={episode.id}>
									<td style={{ width: 55 }}>
										<Image
											width={120}
											height={120}
											src={episode.thumbnail}
											alt={episode.title}
											objectFit="cover"
										/>
									</td>
									<td>
										<Link href={`/episodes/${episode.id}`}>
											<a>{episode.title}</a>
										</Link>
									</td>
									<td>{episode.members}</td>
									<td style={{ width: 85 }}>{episode.publishedAt}</td>
									<td>{episode.durationAsString}</td>
									<td>
										<button
											type="button"
											onClick={() => playList(episodeList, index + lastedEpisodes.length)}
										>
											<img src="/play-green.svg" alt="Play this episode now" />
										</button>
									</td>
								</tr>
							);
						})}
					</tbody>
				</table>
			</section>
		</div>
	);
}

export const getStaticProps: GetStaticProps = async () => {
	const { data } = await api.get('episodes', {
		params: {
			_limit: 12,
			_sort: 'published_at',
			_order: 'desc'
		}
	});

	const episodes = data.map((episode) => {
		return {
			id: episode.id,
			title: episode.title,
			thumbnail: episode.thumbnail,
			members: episode.members,
			publishedAt: format(parseISO(episode.published_at), 'd MMM yy', { locale: ptBR }),
			duration: Number(episode.file.duration),
			durationAsString: convertDurationToTimeString(Number(episode.file.duration)),
			url: episode.file.url
		};
	});

	const lastedEpisodes = episodes.slice(0, 2); // Dois primeiros episodios (Decrescente de acordo com a data)
	const allEpisodes = episodes.slice(2, episodes.length); // Restante dos epiosodios

	return {
		props: {
			lastedEpisodes,
			allEpisodes
		},
		revalidate: 60 * 60 * 8
	};
};
