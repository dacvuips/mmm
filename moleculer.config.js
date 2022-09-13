"use strict";

module.exports = {
	namespace: "3mshop",
	//transporter: "TCP",
	logger: false,
	logLevel: "info",
	cacher: {
		type: "memory",
		options: {
			maxParamsLength: 100
		}
	},
	metrics: false,
	tracing: {
		enabled: false,
		exporter: [
			{
				type: "Console",
				options: {
					width: 100,
					colors: true,
				}
			}
		]
	},
	validator: true
};