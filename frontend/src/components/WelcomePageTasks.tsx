import i18next from 'i18next';
import React, { Component } from 'react';

import { TaskItem } from '../../../src/lib/types/taskItem';
import { getSocket } from './tools';

require ('../styles/welcome/WelcomePageTasks.scss');

interface IProps {
  limit: number;
}

interface IState {
  tasks: Array<TaskItem>;
  i:number;
}

class WelcomePageTasks extends Component<IProps, IState> {
	constructor(props:IProps) {
		super(props);
		this.state = {
			tasks: [],
      		i:0
		};
	}

	componentDidMount() {
		getSocket().on('tasksUpdated', (tasks:Array<TaskItem>) => {
			const t = this.state.tasks;
			for(const i in tasks)	{
				t[i] = tasks[i];
				t[i].time = (new Date()).getTime();
			}
			this.setState({tasks:t});
		});
		setInterval(() => this.setState({i:this.state.i+1}), 1000);
	}

	render() {
		const t = [];
		let tCount = 0;
		for(const i in this.state.tasks) {
			t.push(this.state.tasks[i]);
		}

  	return (
			<div className="welcome-page-tasks-wrapper">
				{
					t.map((item,index) => {
						if(tCount>=this.props.limit) // no more than 3 tasks displayed
							return null;

						if((new Date()).getTime() - (item.time as number) > 5000)
							return null;

						tCount++;

						return (<blockquote key={index}>
							<p className="text">
			  	{i18next.t(`TASKS.${item.text as string}`) !== `TASKS.${item.text as string}` ? i18next.t(`TASKS.${item.text as string}`) : item.text}
								<span className="subtext">{i18next.t(`TASKS.${item.subtext as string}`) !== `TASKS.${item.subtext as string}` ? i18next.t(`TASKS.${item.subtext as string}`) : item.subtext}</span>
							</p>
							<div className="progress"><div className={'progress-bar ' + (item.percentage===null ? 'unknown' : '')} style={{width:(item.percentage!==null ? item.percentage+'%' : '100%')}}></div></div>
						</blockquote>);
					})
				}
			</div>
  	);
	}
}

export default WelcomePageTasks;
