export class BaseNotificationManager {
	constructor() {
		return;
	}

	cleanUserEntries(data: any) {
		Object.keys(data).forEach(x => {
			if (!data[x] || x === "details") return;
			data[x] = data[x].toString().replace("\n", " ");
		});
		return data;
	}
}