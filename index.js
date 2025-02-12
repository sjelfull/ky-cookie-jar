export function withCookieJar(kyInstance, { jar }) {
	return kyInstance.extend({
		hooks: {
			beforeRequest: [
				async (request) => {
					const cookies = await jar.getCookieString(request.url);
					if (cookies) {
						request.headers.set('Cookie', cookies);
					}
				},
			],

			afterResponse: [
				async (request, _options, response) => {
					const setCookieHeaders = response.headers.get('Set-Cookie');

					if (setCookieHeaders) {
						const cookies = Array.isArray(setCookieHeaders)
							? setCookieHeaders
							: [setCookieHeaders];

						await Promise.all(
							cookies.map(
								(cookie) =>
									new Promise((resolve, reject) => {
										jar.setCookie(
											cookie,
											response.url,
											{ ignoreError: false },
											(error) => (error ? reject(error) : resolve()),
										);
									}),
							),
						);
					}

					return response;
				},
			],
		},
	});
}
