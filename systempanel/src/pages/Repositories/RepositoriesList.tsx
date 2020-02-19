import React, {Component} from 'react';
import axios from 'axios';
import {connect} from 'react-redux';
import {Icon, Button, Layout, Table, Divider, Checkbox, Tooltip} from 'antd';
import {Link} from 'react-router-dom';
import {loading, errorMessage, warnMessage, infoMessage} from '../../actions/navigation';
import {ReduxMappedProps} from '../../react-app-env';
import i18next from 'i18next';
import { Repository } from '../../../../src/lib/types/repo';

interface RepositoryListState {
	repositories: Array<Repository>,
	repository?: Repository
}

class RepositoryList extends Component<ReduxMappedProps, RepositoryListState> {

	constructor(props) {
		super(props);
		this.state = {
			repositories: []
		};

	}

	componentDidMount() {
		this.props.loading(true);
		this.refresh();
	}

	refresh() {
		axios.get('/api/repos')
			.then(res => {
				this.props.loading(false);
				this.setState({repositories: res.data});
			})
			.catch(err => {
				this.props.loading(false);
				this.props.errorMessage(`${err.response.status}: ${err.response.statusText}. ${err.response.data}`);
			});
	}

	async deleteRepository(repository: Repository) {
		await axios.delete('/api/repos/' + repository.Name);
		this.refresh();
	}

	move(index: number, change:number) {
		let repositories = this.state.repositories;
		let firstRepos =  repositories[index];
		let secondRepos = repositories[index + change];
		repositories[index + change] = firstRepos;
		repositories[index] = secondRepos;
		axios.put('/api/settings', {
			setting: {System:{Repositories: repositories}}
		})
			.then(() => this.refresh())
			.catch((err) => this.props.errorMessage(`${err.response.status}: ${err.response.statusText}. ${err.response.data}`));
	}

	render() {
		return (
			<Layout.Content style={{ padding: '25px 50px', textAlign: 'center' }}>
				<Layout>
					<Layout.Header>
					<span><Link to={`/system/km/repositories/new`}>{i18next.t('REPOSITORIES.NEW_REPOSITORY')}<Icon type="plus" /></Link></span>
					</Layout.Header>
					<Layout.Content>
						<Table
							dataSource={this.state.repositories}
							columns={this.columns}
							rowKey='name'
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
		render: (text, record:Repository) => (record.Path.Karas.map(item => {return <div key={item}>{item}</div>}))
	}, {
		title: i18next.t('REPOSITORIES.PATH_LYRICS'),
		dataIndex: 'Path.Lyrics',
		key: 'path_lyrics',
		render: (text, record:Repository) => (record.Path.Lyrics.map(item => {return <div key={item}>{item}</div>}))
	}, {
		title: i18next.t('REPOSITORIES.PATH_MEDIAS'),
		dataIndex: 'Path.Medias',
		key: 'path_medias',
		render: (text, record:Repository) => (record.Path.Medias.map(item => {return <div key={item}>{item}</div>}))
	}, {
		title: i18next.t('REPOSITORIES.PATH_SERIES'),
		dataIndex: 'Path.Series',
		key: 'path_series',
		render: (text, record:Repository) => (record.Path.Series.map(item => {return <div key={item}>{item}</div>}))
	}, {
		title: i18next.t('REPOSITORIES.PATH_TAGS'),
		dataIndex: 'Path.Tags',
		key: 'path_tags',
		render: (text, record:Repository) => (record.Path.Tags.map(item => {return <div key={item}>{item}</div>}))
	}, {
		title: i18next.t('REPOSITORIES.ONLINE'),
		dataIndex: 'Online',
		key: 'online',
		render: (text, record) => (<Checkbox disabled={true} checked={record.Online} />)
	}, {
		title: <span>{i18next.t('REPOSITORIES.MOVE')}&nbsp;
			<Tooltip title={i18next.t('REPOSITORIES.MOVE_TOOLTIP')}>
				<Icon type="question-circle-o" />
			</Tooltip>
		</span> ,
		key: 'move',
		render: (text, record, index) => {
			return <React.Fragment>
					{index > 0 ? 
						<Button type="default" icon='arrow-up' onClick={() => this.move(index, -1)}></Button> : null}
					{index < this.state.repositories.length-1 ?  
						<Button type="default" icon='arrow-down' onClick={() => this.move(index, +1)}></Button> : null}
				</React.Fragment>
		}
	}, {
		title: i18next.t('ACTION'),
		key: 'action',
		render: (text, record:Repository) => (
			<span>
				<Link to={`/system/km/repositories/${record.Name}`}><Icon type='edit'/></Link>
				{this.state.repositories.length > 1 ?
					<React.Fragment>
						<Divider type="vertical"/>
						<Button type="danger" icon='delete' onClick={this.deleteRepository.bind(this,record)}></Button>
					</React.Fragment> : null
				}
			</span>
		)
	}];
}

const mapStateToProps = (state) => ({
	loadingActive: state.navigation.loading
});

const mapDispatchToProps = (dispatch) => ({
	loading: (active) => dispatch(loading(active)),
	infoMessage: (message) => dispatch(infoMessage(message)),
	errorMessage: (message) => dispatch(errorMessage(message)),
	warnMessage: (message) => dispatch(warnMessage(message))
});


export default connect(mapStateToProps, mapDispatchToProps)(RepositoryList);