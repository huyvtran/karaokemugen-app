import { CheckCircleTwoTone, ClockCircleTwoTone, DownloadOutlined, InfoCircleTwoTone, SyncOutlined, WarningTwoTone } from '@ant-design/icons';
import { Button, Cascader, Col, Input, Layout, Radio, Row, Select, Table } from 'antd';
import Axios from 'axios';
import i18next from 'i18next';
import prettyBytes from 'pretty-bytes';
import React, { Component } from 'react';

import { DBKaraTag } from '../../../../src/lib/types/database/kara';
import { DBTag } from '../../../../src/lib/types/database/tag';
import { DBDownload } from '../../../../src/types/database/download';
import { DBPLC } from '../../../../src/types/database/playlist';
import { KaraDownloadRequest } from '../../../../src/types/download';
import { socket } from '../../App';
import { getTagInLocale, getTagInLocaleList } from '../../utils/kara';
import { tagTypes } from '../../utils/tagTypes';
import { getCriterasByValue } from './_blc_criterias_types';

let blacklistCache = {};

interface KaraDownloadState {
	karas_local: any[];
	karas_online: any[];
	i18nTag: any;
	blacklistCriterias: any[];
	karasOnlineCount: number;
	karasQueue: DBDownload[];
	kara: any;
	currentPage: number;
	currentPageSize: number;
	filter: string;
	tagFilter: string;
	tags: DBTag[];
	compare: string;
	totalMediaSize: string;
	tagOptions: any[];
}

class KaraDownload extends Component<unknown, KaraDownloadState> {

	constructor(props) {
		super(props);
		this.state = {
			karas_local: [],
			karas_online: [],
			i18nTag: {},
			karasOnlineCount: 0,
			blacklistCriterias: [],
			karasQueue: [],
			kara: {},
			currentPage: parseInt(localStorage.getItem('karaDownloadPage')) || 1,
			currentPageSize: parseInt(localStorage.getItem('karaDownloadPageSize')) || 100,
			filter: localStorage.getItem('karaDownloadFilter') || '',
			tagFilter: '',
			tags: [],
			compare: '',
			totalMediaSize: '',
			tagOptions: []
		};
	}

	componentDidMount() {
		this.api_get_online_karas();
		this.apiGetBlacklistCriterias();
		this.blacklistCheckEmptyCache();
		this.apiReadKaraQueue();
		this.apiGetLocalKaras();
		this.getTags();
		socket.on('downloadQueueStatus', (data?: any) => {
			this.setState({ karasQueue: data });
			this.apiGetLocalKaras();
		});
	}

	async getTags() {
		const res = await Axios.get('/tags/remote');
		await this.setState({ tags: res.data.content });
		this.FilterTagCascaderOption();
	}

	changeFilter = (event) => {
		this.setState({ filter: event.target.value, currentPage: 0 }, () => {
			localStorage.setItem('karaDownloadFilter', this.state.filter);
		});
	}

	downloadKara = (kara) => {
		const downloadObject: KaraDownloadRequest = {
			kid: kara.kid,
			size: kara.mediasize,
			name: kara.name,
			repository: kara.repository
		};
		this.postToDownloadQueue([downloadObject]);
	}

	downloadAll = async () => {
		const p = Math.max(0, this.state.currentPage - 1);
		const psz = this.state.currentPageSize;
		const pfrom = p * psz;
		const response = await Axios.get(`/karas/remote?filter=${this.state.filter}&q=${this.state.tagFilter}&from=${pfrom}&size=${psz}${this.state.compare}`);
		const karas = response.data.content;
		const karasToDownload: KaraDownloadRequest[] = [];
		for (const kara of karas) {
			if (this.blacklistCheck(kara)) {
				karasToDownload.push({
					kid: kara.kid,
					size: kara.mediasize,
					name: kara.karafile.replace('.kara.json', ''),
					repository: kara.repository
				});
			}
		}
		this.postToDownloadQueue(karasToDownload);
	}

	apiGetLocalKaras = async () => {
		const res = await Axios.get('/karas');
		this.setState({ karas_local: res.data.content });
	}

	async apiGetBlacklistCriterias() {
		const res = await Axios.get('/downloads/blacklist/criterias');
		if (res.data.length) {
			const criterias = res.data.map(function (criteria) {
				const c = getCriterasByValue(criteria.type);
				if (c && c.fields && c.fields.length > 0) {
					criteria.filter = c;
					criteria.value = criteria.value.toLowerCase();
					return criteria;
				}
				return null;
			});
			this.setState({ blacklistCriterias: criterias });
		}
	}

	blacklistCheckEmptyCache() {
		blacklistCache = {};
	}
	blacklistCheck(kara) {
		// avoid lots of kara check operation on re-render
		if (blacklistCache[kara.kid] !== undefined)
			return blacklistCache[kara.kid];

		blacklistCache[kara.kid] = true;
		if (this.state.blacklistCriterias.length) {
			this.state.blacklistCriterias.map(criteria => {
				if (criteria.filter.test === 'contain') {
					criteria.filter.fields.map(field => {
						if (typeof (kara[field]) === 'string') {
							if (kara[field].toLowerCase().match(criteria.value)) {
								blacklistCache[kara.kid] = false;
							}
						} else if (kara[field] && kara[field].length > 0) {
							kara[field].map(t => {
								if (t) {
									if (typeof t === 'string') {
										if (t.toLowerCase().match(criteria.value)) {
											blacklistCache[kara.kid] = false;
										}
									} else if (t.name) {
										if (t.name.toLowerCase().match(criteria.value)) {
											blacklistCache[kara.kid] = false;
										}
									}
								}
								return null;
							});
						}
						return null;
					});
				}
				return null;
			});
		}

		return blacklistCache[kara.kid];
	}

	api_get_online_karas = async () => {
		const p = Math.max(0, this.state.currentPage - 1);
		const psz = this.state.currentPageSize;
		const pfrom = p * psz;
		const res = await Axios.get(`/karas/remote?filter=${this.state.filter}&q=${this.state.tagFilter}&from=${pfrom}&size=${psz}${this.state.compare}`);
		let karas = res.data.content;
		karas = karas.map((kara) => {
			kara.name = kara.karafile.replace('.kara.json', '');
			return kara;
		});
		this.setState({
			karas_online: karas,
			karasOnlineCount: res.data.infos.count || 0,
			i18nTag: res.data.i18n,
			totalMediaSize: prettyBytes(res.data.infos.totalMediaSize)
		});
	}

	apiReadKaraQueue = async () => {
		const res = await Axios.get('/downloads');
		this.setState({ karasQueue: res.data });
	}

	handleTableChange = (pagination, filters, sorter) => {
		this.setState({
			currentPage: pagination.current,
			currentPageSize: pagination.pageSize,
		});
		localStorage.setItem('karaDownloadPage', pagination.current);
		localStorage.setItem('karaDownloadPageSize', pagination.pageSize);
		setTimeout(this.api_get_online_karas, 10);
	};

	handleFilterTagSelection = (value) => {
		let t = '';
		if (value && value[1])
			t = 't:' + value[1] + '~' + value[0];

		this.setState({ tagFilter: t, currentPage: 0 }, () => {
			localStorage.setItem('karaDownloadPage', '0');
			localStorage.setItem('karaDownloadtagFilter', this.state.tagFilter);
			setTimeout(this.api_get_online_karas, 10);
		});
	}

	FilterTagCascaderOption = () => {
		const options = Object.keys(tagTypes).map(type => {
			const typeID = tagTypes[type];

			const option = {
				value: typeID,
				label: i18next.t(`TAG_TYPES.${type}`),
				children: []
			};
			for (const tag of this.state.tags.filter(tag => tag.types.length && tag.types.indexOf(typeID) >= 0)) {
				option.children.push({
					value: tag.tid,
					label: getTagInLocale(tag as unknown as DBKaraTag),
				});
			}
			return option;
		});
		this.setState({ tagOptions: options });
	}

	getGroupsTags = () => {
		return this.state.tags.filter((tag, index, self) =>
			tag.types.includes(tagTypes.GROUPS) && index === self.findIndex((t) => (
				t.tid === tag.tid
			))
		).map(tag => {
			return {
				value: tag.tid,
				label: tag.name,
			};
		});
	}

	FilterTagCascaderFilter = function (inputValue, path) {
		return path.some(option => option.label.toLowerCase().indexOf(inputValue.toLowerCase()) > -1);
	}

	// START karas download queue
	putToDownloadQueueStart() {
		Axios.put('/downloads/start');
	}

	// PAUSE karas download queue
	putToDownloadQueuePause() {
		Axios.put('/downloads/pause');
	}

	// POST (add) items to download queue
	postToDownloadQueue(downloads: KaraDownloadRequest[]) {
		Axios.post('/downloads', {
			downloads
		});
	}

	importPlaylist = (event: any) => {
		if (!window.FileReader) return alert('FileReader API is not supported by your browser.');
		const input = event.target;
		if (input.files && input.files[0]) {
			const file = input.files[0];
			const fr = new FileReader();
			fr.onload = async () => {
				const response = await Axios.post('/playlists/import', { playlist: fr['result'] });
				if (response.data.data.unknownKaras && response.data.data.unknownKaras.length > 0) {
					Axios.post('/downloads', {
						downloads: response.data.data.unknownKaras.map((kara: DBPLC) => {
							return {
								kid: kara.kid,
								mediafile: kara.mediafile,
								size: kara.mediasize,
								name: kara.karafile.replace('.kara.json', ''),
								repository: kara.repository
							};
						})
					});
				}
				Axios.delete(`/playlists/${response.data.data.playlist_id}`);
			};
			fr.readAsText(file);
		}
	};


	render() {
		return (
			<Layout.Content style={{ padding: '25px 50px' }}>
				<Layout>
					<Layout.Header>
						<Row justify="space-between">
							<Col flex={3} style={{ marginRight: '10px' }}>
								<Input.Search
									placeholder={i18next.t('SEARCH_FILTER')}
									value={this.state.filter}
									onChange={event => this.changeFilter(event)}
									enterButton={i18next.t('SEARCH')}
									onSearch={this.api_get_online_karas}
								/>
							</Col>
							<Col flex={1} style={{ textAlign: 'center' }}>
								<label htmlFor="playlistImport" className="ant-btn ant-btn-primary">{i18next.t('KARA.IMPORT_PLAYLIST')}</label>
								<Input id="playlistImport" type="file" accept=".kmplaylist" style={{ display: 'none' }} onChange={this.importPlaylist} />
							</Col>
							<Col flex={2}>
								<Select allowClear style={{ width: '90%' }} onChange={(value) => this.handleFilterTagSelection([tagTypes.GROUPS, value])}
									placeholder={i18next.t('KARA.TAG_GROUP_FILTER')} key={'tid'} options={this.getGroupsTags()} />
							</Col>
							<Col flex={2}>
								<Cascader style={{ width: '90%' }} options={this.state.tagOptions}
									showSearch={{ filter: this.FilterTagCascaderFilter, matchInputWidth: false }}
									onChange={this.handleFilterTagSelection} placeholder={i18next.t('KARA.TAG_FILTER')} />
							</Col>
						</Row>
						<Row style={{ margin: '10px' }}>
							<Col span={11}>
								<label>{i18next.t('KARA.TOTAL_MEDIA_SIZE')} {this.state.totalMediaSize}</label>
							</Col>
						</Row>
						<Row justify="space-between">
							<Col span={11}>
								<Button style={{ width: '230px' }} type="primary" key="synchronize"
									onClick={() => Axios.post('/downloads/sync')}>{i18next.t('KARA.SYNCHRONIZE')}</Button>
								&nbsp;
								{i18next.t('KARA.SYNCHRONIZE_DESC')}
							</Col>
							<Col span={4}>
								<label>{i18next.t('KARA.FILTER_SONGS')}</label>
							</Col>
							<Col span={4}>
								<Row>
									<label>{i18next.t('KARA.QUEUE_LABEL')}</label>
								</Row>
								<Row>
									<label>{i18next.t('KARA.QUEUE_LABEL_SONGS', {
										numberSongs: this.state.karasQueue.filter(kara => kara.status !== 'DL_DONE'
											&& kara.status !== 'DL_FAILED').length
									})}</label>
								</Row>
							</Col>
						</Row>
						<Row style={{ paddingTop: '5px' }} justify="space-between">
							<Col span={11}>
								<Button style={{ width: '230px' }} type="primary" key="queueDownloadAll"
									onClick={() => Axios.post('/downloads/all')}>{i18next.t('KARA.DOWNLOAD_ALL')}</Button>
								&nbsp;
								{i18next.t('KARA.DOWNLOAD_ALL_DESC')}
							</Col>
							<Col span={4}>
								<Radio checked={this.state.compare === ''}
									onChange={async () => {
										await this.setState({ compare: '', currentPage: 0 });
										this.api_get_online_karas();
									}}>{i18next.t('KARA.FILTER_ALL')}</Radio>
							</Col>
							<Col span={4}>
								<Button style={{ width: '100px' }} type="primary" key="queueStart"
									onClick={this.putToDownloadQueueStart}>{i18next.t('KARA.START_DOWNLOAD_QUEUE')}</Button>
							</Col>
						</Row>
						<Row style={{ paddingTop: '5px' }} justify="space-between">
							<Col span={11}>
								<Button style={{ width: '230px' }} type="primary" key="queueUpdateAll"
									onClick={() => Axios.post('/downloads/update')}>{i18next.t('KARA.UPDATE_ALL')}</Button>
								&nbsp;
								{i18next.t('KARA.UPDATE_ALL_DESC')}
							</Col>
							<Col span={4}>
								<Radio checked={this.state.compare === '&compare=updated'}
									onChange={async () => {
										await this.setState({ compare: '&compare=updated', currentPage: 0 });
										this.api_get_online_karas();
									}}>{i18next.t('KARA.FILTER_UPDATED')}</Radio>
							</Col>
							<Col span={4}>
								<Button style={{ width: '100px' }} type="primary" key="queuePause"
									onClick={this.putToDownloadQueuePause}>{i18next.t('KARA.PAUSE_DOWNLOAD_QUEUE')}</Button>
							</Col>
						</Row>
						<Row style={{ paddingTop: '5px' }} justify="space-between">
							<Col span={11}>
								<Button style={{ width: '230px' }} type="primary" key="queueCleanAll"
									onClick={() => Axios.post('/downloads/clean')}>{i18next.t('KARA.CLEAN_ALL')}</Button>
								&nbsp;
								{i18next.t('KARA.CLEAN_ALL_DESC')}
							</Col>
							<Col span={4}>
								<Radio checked={this.state.compare === '&compare=missing'}
									onChange={async () => {
										await this.setState({ compare: '&compare=missing', currentPage: 0 });
										this.api_get_online_karas();
									}}>{i18next.t('KARA.FILTER_NOT_DOWNLOADED')}</Radio>
							</Col>
							<Col span={4}>
								<Button style={{ width: '100px' }} type="primary" key="queueDelete"
									onClick={() => Axios.delete('/downloads')}>{i18next.t('KARA.WIPE_DOWNLOAD_QUEUE')}</Button>
							</Col>
						</Row>
					</Layout.Header>
					<Layout.Content>

						<Table
							onChange={this.handleTableChange}
							dataSource={this.state.karas_online}
							columns={this.columns}
							rowKey='kid'
							pagination={{
								position: ['topRight', 'bottomRight'],
								current: this.state.currentPage || 1,
								defaultPageSize: this.state.currentPageSize,
								pageSize: this.state.currentPageSize,
								pageSizeOptions: ['10', '25', '50', '100', '500'],
								showTotal: (total, range) => {
									const to = range[1];
									const from = range[0];
									return i18next.t('KARA.SHOWING', { from: from, to: to, total: total });
								},
								total: this.state.karasOnlineCount,
								showQuickJumper: true,
							}}
						/>
					</Layout.Content>
				</Layout>
			</Layout.Content>
		);
	}

	isLocalKara(kara) {
		return this.state.karas_local && this.state.karas_local.find(item => item.kid === kara.kid);
	}
	isQueuedKara(kara) {
		return this.state.karasQueue.find(item => item.name === kara.name);
	}

	columns = [
		{
			title: i18next.t('KARA.LANGUAGES'),
			dataIndex: 'langs',
			key: 'langs',
			render: langs => {
				return getTagInLocaleList(langs, this.state.i18nTag).join(', ');
			}
		}, {
			title: `${i18next.t('KARA.SERIES')} / ${i18next.t('KARA.SINGERS')}`,
			dataIndex: 'serie',
			key: 'serie',
			render: (serie, record) => {
				return serie || getTagInLocaleList(record.singers, this.state.i18nTag).join(', ');
			}
		}, {
			title: i18next.t('KARA.SONGTYPES'),
			dataIndex: 'songtypes',
			key: 'songtypes',
			render: (songtypes, record) => {
				const songorder = record.songorder || '';
				return getTagInLocaleList(songtypes, this.state.i18nTag).sort().join(', ') + ' ' + songorder || '';
			}
		}, {
			title: i18next.t('KARA.FAMILIES'),
			dataIndex: 'families',
			key: 'families',
			render: (families, record) => {
				return getTagInLocaleList(families, this.state.i18nTag).join(', ');
			}
		}, {
			title: i18next.t('KARA.TITLE'),
			dataIndex: 'title',
			key: 'title',
			render: (title, record) => {
				if (this.isLocalKara(record.kid))
					return <strong>{title}</strong>;
				return <span>{title}</span>;

			}
		}, {
			title: i18next.t('KARA.REPOSITORY'),
			dataIndex: 'repository',
			key: 'repository',
		}, {
			title: i18next.t('KARA.DETAILS'),
			key: 'details',
			render: (text, record) => {
				return <Button type="default" href={`https://${record.repository}/base/kara/${record.kid}`}><InfoCircleTwoTone /></Button>;
			}
		}, {
			title: <span><Button title={i18next.t('KARA.DOWNLOAD_ALL_TOOLTIP')} type="default"
				onClick={this.downloadAll}><DownloadOutlined /></Button>{i18next.t('KARA.DOWNLOAD')}
			</span>,
			key: 'download',
			render: (text, record) => {
				let button = null;
				const blacklisted = !this.blacklistCheck(record);
				if (this.isLocalKara(record)) {
					button = <Button disabled type="default"><CheckCircleTwoTone twoToneColor="#52c41a" /></Button>;
				} else {
					const queue = this.isQueuedKara(record);
					if (queue) {
						if (queue.status === 'DL_RUNNING') {
							button = <span><Button disabled type="default"><SyncOutlined spin /></Button></span>;
						} else if (queue.status === 'DL_PLANNED') {
							button = <Button onClick={() => Axios.delete(`/downloads/${queue.uuid}`)} type="default">
								<ClockCircleTwoTone twoToneColor="#dc4e41" />
							</Button>;
						} else if (queue.status === 'DL_DONE') {// done but not in local -> try again dude
							button = <span><Button type="default" onClick={() => this.downloadKara(record)}><CheckCircleTwoTone twoToneColor="#4989f3" /></Button></span>;
						} else if (queue.status === 'DL_FAILED') {
							button = <span><Button type="default" onClick={() => this.downloadKara(record)}><WarningTwoTone twoToneColor="#f24848" /></Button></span>;
						}
					} else {
						if (blacklisted) {
							button = <Button type="primary" danger onClick={() => this.downloadKara(record)}><DownloadOutlined /></Button>;
						} else {
							button = <Button type="default" onClick={() => this.downloadKara(record)}><DownloadOutlined /></Button>;
						}
					}
				}
				return <span>{button} {Math.round(record.mediasize / (1024 * 1024))}Mb {blacklisted ? <small style={{ color: '#f5232e' }}>{i18next.t('KARA.IN_BLACKLIST')}</small> : null}</span>;
			}
		}];
}

export default KaraDownload;
