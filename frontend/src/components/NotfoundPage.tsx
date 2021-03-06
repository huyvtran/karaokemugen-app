import i18next from 'i18next';
import React, { Component } from 'react';

import image404 from '../assets/nanami-surpris.png';

class NotfoundPage extends Component {

	render() {
		return (
			<div className="page404-lost">
				<h1>{i18next.t('404')}</h1>
				<h3>{i18next.t('404_2')}</h3>
				<div className="you-are-here">{location.pathname} &lt;----- {i18next.t('404_3')}</div>
				<a href="/" className="page404-btn">{i18next.t('404_4')}</a><br/>
				<img height="150" src={image404} />
			</div>
		);
	}
}

export default NotfoundPage;