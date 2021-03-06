import React, {Component} from 'react';
import {Layout} from 'antd';
import {Link} from 'react-router-dom';
import i18next from 'i18next';

class Home extends Component<{}, {}> {
	render() {
		return (
			<Layout.Content style={{ padding: '25px 50px', textAlign: 'left' }}>
				<h1>{i18next.t('HOME.WELCOME')}</h1>
				<p>{i18next.t('HOME.DIFFERENTS_MENUS')}</p>
				<ul>
					<li>
						<b>{i18next.t('MENU.SYSTEM')} : </b> {i18next.t('HOME.SYSTEM_DESCRIPTION')}
					</li>
					<li>
						<b>{i18next.t('MENU.KARAS')} : </b> {i18next.t('HOME.KARAS_DESCRIPTION_1')} 
						<Link to={`/system/km/karas/download`}>{i18next.t('HOME.KARAS_DESCRIPTION_2')}</Link>
						{i18next.t('HOME.KARAS_DESCRIPTION_3')}
					</li>
					<li>
						<b>{i18next.t('MENU.TAGS')} : </b> {i18next.t('HOME.TAGS_DESCRIPTION')}
					</li>
					<li>
						<b>{i18next.t('MENU.USERS')} : </b> {i18next.t('HOME.USERS_DESCRIPTION_1')}
						<Link to={`/system/km/users`}>{i18next.t('HOME.USERS_DESCRIPTION_2')}</Link>
						{i18next.t('HOME.USERS_DESCRIPTION_3')}
					</li>
				</ul>
			</Layout.Content>
		);
	}
}

export default Home;