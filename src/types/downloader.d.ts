import Task from '../lib/utils/taskManager';

export interface DownloadItem {
	url: string,
	filename: string,
	size?: number,
	id?: string,
}

export interface DownloadOpts {
	bar: boolean,
	task: Task
	auth?: {
		user: string,
		pass: string
	}
}