import io from 'socket.io-client';
import Modal from './modals/Modal';
import React from 'react';
import ReactDOM from 'react-dom';
import store from '../store';
import Tutorial from './modals/Tutorial';
import { toast, TypeOptions } from 'react-toastify';
import { DBPLC } from '../../../src/types/database/playlist';


const socket = io();

export function getSocket() {
	return socket;
}

export function parseJwt(token:string) {
	var base64Url = token.split('.')[1];
	var base64 = base64Url.replace('-', '+').replace('_', '/');
	return JSON.parse(window.atob(base64));
};

export function createCookie(name:string, value:any, days?:number) {
	var expires;
	if (days) {
		var date = new Date();
		if (days === -1) days = 365 * 15;
		date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
		expires = '; expires=' + date.toUTCString();
	} else expires = '';
	document.cookie = name + '=' + value + expires + '; path=/';
};

export function readCookie(name:string) {
	var nameEQ = name + '=';
	var ca = document.cookie.split(';');
	for (var i = 0; i < ca.length; i++) {
		var c = ca[i];
		while (c.charAt(0) == ' ') c = c.substring(1, c.length);
		if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
	}
	return null;
};

export function eraseCookie(name:string) {
	createCookie(name, '', -1);
};

export function is_touch_device() {
	if (!navigator.userAgent.toLowerCase().includes('mobi')) return false;

	var prefixes = ' -webkit- -moz- -o- -ms- '.split(' ');
	var mq = function (query:string) {
		return window.matchMedia(query).matches;
	};

	if ('ontouchstart' in window) {
		return true;
	}

	// include the 'heartz' as a way to have a non matching MQ to help terminate the join
	// https://git.io/vznFH
	var query = ['(', prefixes.join('touch-enabled),('), 'heartz', ')'].join('');
	return mq(query);
};


export function expand(str:string, val:any) {
	return str.split('.').reduceRight((acc, currentValue) => {
		return { [currentValue]: acc };
	}, val);
};

export function dotify(obj:any) {
	//Code from the package node-dotify
	let res:any = {};
	function recurse(obj:any, current:any) {
		for (var key in obj) {
			let value = obj[key];
			let newKey = (current ? current + '.' + key : key);  // joined key with dot
			if (value && typeof value === 'object' && !Array.isArray(value)) {
				recurse(value, newKey);  // it's a nested object, so do it again
			} else {
				res[newKey] = value;  // it's not an object, so set the property
			}
		}
	}
	recurse(obj, undefined);
	return res;
};

/* format seconds to Hour Minute Second */
export function secondsTimeSpanToHMS(s:number, format:string) {
	var d = Math.floor(s / (3600 * 24));
	if (format === '24h' || format === 'dhm') {
		s -= d * 3600 * 24;
	}
	var h = Math.floor(s / 3600);
	if (format !== 'ms') {
		s -= h * 3600;
	}
	var m = Math.floor(s / 60);
	s -= m * 60;

	var result = (h > 0 ? h + 'h' : '') + (m < 10 ? '0' + m : m) + 'm' + (s < 10 ? '0' + s : s) + 's';
	if (format === 'ms') result = (m > 0 ? m + 'm' : '') + (s < 10 && m > 0 ? '0' + s : s) + 's';
	if (format === 'hm') result = (h > 0 ? h + 'h' : '') + (m < 10 ? '0' + m : m) + 'm';
	if (format === 'dhm') {
		result = (d > 0 ? d + 'd' : '') + (h > 0 ? h + 'h' : '') + (m < 10 ? '0' + m : m) + 'm';
	}
	return result;
};

export function startIntro(scope:string) {
	store.setTuto(ReactDOM.render(
		React.createElement(Tutorial, {scope: scope}),
		document.getElementById('tuto')
	));
		
	return store.getTuto();
};

/**
* Build kara title for users depending on the data
* @param {Object} data - data from the kara
* @param {boolean} onlyText - if only text and no component
* @return {String} the title
*/
export function buildKaraTitle(data:DBPLC, onlyText?:boolean) {
	var isMulti = data.langs ? data.langs.find(e => e.name.indexOf('mul') > -1) : false;
	if (data.langs && isMulti) {
		data.langs = [isMulti];
	}
	var serieText = data.serie ? data.serie : (data.singers ? data.singers.map(e => e.name).join(', ') : '');
	var langsText = data.langs.map(e => e.name).join(', ').toUpperCase();
	var songtypeText = data.songtypes[0].short ? + data.songtypes[0].short : data.songtypes[0].name;
	var songorderText = data.songorder > 0 ? ' ' + data.songorder : '';
	
	if (onlyText) {
		return `${langsText} - ${serieText} - ${songtypeText} ${songorderText} - ${data.title}`
	} else {
		return (<React.Fragment>
			<div>{langsText}</div>
			<div>&nbsp;-&nbsp;</div>
			<div className="karaTitleSerie">{serieText}</div>
			<div>&nbsp;-&nbsp;</div>
			<div>{`${songtypeText} ${songorderText}`}</div>
			<div>&nbsp;-&nbsp;</div>
			<div className="karaTitleTitle">{data.title}</div>
			</React.Fragment>)
	}
};

export function displayMessage (type:TypeOptions, message:any, time?:number) {
	if (!time) time = 3500;
	toast(message, {type: type, autoClose: time, position: 'top-center'});
}

export function callModal(type:string, title:any, message:any, callback?:any, placeholder?:string) {
	ReactDOM.render(
		React.createElement(Modal, 
			{type: type, title: title, message: message, callback: callback, placeholder: placeholder}),
		document.getElementById('modal')
	);
}