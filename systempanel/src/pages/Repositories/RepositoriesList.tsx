import { ArrowDownOutlined, ArrowUpOutlined, DeleteOutlined, EditOutlined,PlusOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { Button, Checkbox, Divider, Layout, Table, Tooltip } from 'antd';
import Axios from 'axios';
import i18next from 'i18next';
import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import { Repository } from '../../../../src/lib/types/repo';
import { getAxiosInstance } from '../../axiosInterceptor';

interface RepositoryListState {
	repositories: Array<Repository>,
	repository?: Repository
}

let timer: any;
class RepositoryList extends Component<unknown, RepositoryListState> {

	constructor(props) {
		super(props);
		this.state = {
			repositories: []
		};
	}

	componentDidMount() {
		this.refresh();
	}

	refresh = async () => {
		const res = await Axios.get('/repos');
		this.setState({ repositories: res.data });
	}

	deleteRepository = async (repository: Repository) => {
		await getAxiosInstance().delete(`/repos/${repository.Name}`);
		this.refresh();
	}

	move = async (index: number, change: number) => {
		const repositories = this.state.repositories;
		const firstRepos = repositories[index];
		const secondRepos = repositories[index + change];
		repositories[index + change] = firstRepos;
		repositories[index] = secondRepos;
		await Axios.put('/settings', {
			setting: { System: { Repositories: repositories } }
		});
		this.refresh();
		if (timer) clearTimeout(timer);
		timer = setTimeout(() => {
			getAxiosInstance().post('/db/generate');
		}, 5000);
	}

	render() {
		return (
			<Layout.Content style={{ padding: '25px 50px', textAlign: 'center' }}>
				<Layout>
					<Layout.Header>
						<span><Link to={'/system/km/repositories/new'}>{i18next.t('REPOSITORIES.NEW_REPOSITORY')}<PlusOutlined /></Link></span>
					</Layout.Header>
					<Layout.Content>
						<Table
							dataSource={this.state.repositories}
							columns={this.columns}
							rowKey='Name'
						/>
					</Layout.Content>
				</Layout>
			</Layout.Content>
		);
	}

	columns = [{
		title: i18next.t('REPOSITORIES.NAME'),
		dataIndex: 'Name',
		key: 'name'
	}, {
		title: i18next.t('REPOSITORIES.PATH_KARAS'),
		dataIndex: 'Path.Karas',
		key: 'path_karas',
		render: (text, record: Repository) => (record.Path.Karas.map(item => {
			return <div className="pathFolders" key={item}>{item}</div>;
		}))
	}, {
		title: i18next.t('REPOSITORIES.PATH_LYRICS'),
		dataIndex: 'Path.Lyrics',
		key: 'path_lyrics',
		render: (text, record: Repository) => (record.Path.Lyrics.map(item => {
			return <div className="pathFolders" key={item}>{item}</div>;
		}))
	}, {
		title: i18next.t('REPOSITORIES.PATH_MEDIAS'),
		dataIndex: 'Path.Medias',
		key: 'path_medias',
		render: (text, record: Repository) => (record.Path.Medias.map(item => {
			return <div className="pathFolders" key={item}>{item}</div>;
		}))
	}, {
		title: i18next.t('REPOSITORIES.PATH_SERIES'),
		dataIndex: 'Path.Series',
		key: 'path_series',
		render: (text, record: Repository) => (record.Path.Series.map(item => {
			return <div className="pathFolders" key={item}>{item}</div>;
		}))
	}, {
		title: i18next.t('REPOSITORIES.PATH_TAGS'),
		dataIndex: 'Path.Tags',
		key: 'path_tags',
		render: (text, record: Repository) => (record.Path.Tags.map(item => {
			return <div key={item}>{item}</div>;
		}))
	}, {
		title: i18next.t('REPOSITORIES.ONLINE'),
		dataIndex: 'Online',
		key: 'online',
		render: (text, record) => (<Checkbox disabled={true} checked={record.Online} />)
	}, {
		title: i18next.t('REPOSITORIES.ENABLED'),
		dataIndex: 'Enabled',
		key: 'enabled',
		render: (text, record) => (<Checkbox disabled={true} checked={record.Enabled} />)
	}, {
		title: <span>{i18next.t('REPOSITORIES.MOVE')}&nbsp;
			<Tooltip title={i18next.t('REPOSITORIES.MOVE_TOOLTIP')}>
				<QuestionCircleOutlined />
			</Tooltip>
		</span>,
		key: 'move',
		render: (text, record, index) => {
			return (
				<React.Fragment>
					{index > 0 ?
						<Button type="default" icon={<ArrowUpOutlined />} onClick={() => this.move(index, -1)}></Button> : null}
					{index < this.state.repositories.length - 1 ?
						<Button type="default" icon={<ArrowDownOutlined />} onClick={() => this.move(index, +1)}></Button> : null}
				</React.Fragment>
			);
		}
	}, {
		title: i18next.t('ACTION'),
		key: 'action',
		render: (text, record: Repository) => (
			<span>
				<Link to={`/system/km/repositories/${record.Name}`}><EditOutlined /></Link>
				{this.state.repositories.length > 1 ?
					<React.Fragment>
						<Divider type="vertical" />
						<Button type="primary" danger icon={<DeleteOutlined />}
							onClick={() => this.deleteRepository(record)}></Button>
					</React.Fragment> : null
				}
			</span>
		)
	}];
}

export default RepositoryList;
