import test from 'ava';
import ky from 'ky-universal';
import createTestServer from 'create-test-server';
import { CookieJar } from 'tough-cookie';
import { withCookieJar } from './index.js';

let server;

test.before(async () => {
	server = await createTestServer();
});

test.after(async () => {
	await server.close();
});

test('sets and gets cookies', async (t) => {
	const jar = new CookieJar();
	const client = withCookieJar(ky, { jar });

	server.get('/cookies', (request, response) => {
		t.is(request.headers.cookie, 'session=123');
		response.setHeader('Set-Cookie', 'newCookie=456');
		response.send({ success: true });
	});

	await jar.setCookie('session=123', server.url);
	await client.get(`${server.url}/cookies`);

	const cookies = await jar.getCookieString(server.url);
	t.true(cookies.includes('newCookie=456'));
});

test('handles multiple cookies', async (t) => {
	const jar = new CookieJar();
	const client = withCookieJar(ky, { jar });

	server.get('/multiple-cookies', (request, response) => {
		response.setHeader('Set-Cookie', ['cookie1=value1', 'cookie2=value2']);
		response.send({ success: true });
	});

	await client.get(`${server.url}/multiple-cookies`);

	const cookies = await jar.getCookieString(server.url);
	t.true(cookies.includes('cookie1=value1'));
	t.true(cookies.includes('cookie2=value2'));
});

test('persists cookies across different endpoints', async (t) => {
	const jar = new CookieJar();
	const client = withCookieJar(ky, { jar });

	server.get('/set-cookie', (request, response) => {
		response.setHeader('Set-Cookie', 'session=abc123');
		response.send({ success: true });
	});

	server.get('/check-cookie', (request, response) => {
		t.is(request.headers.cookie, 'session=abc123');
		response.send({ success: true });
	});

	// First request sets the cookie
	await client.get(`${server.url}/set-cookie`);

	// Second request to different endpoint should send the cookie
	await client.get(`${server.url}/check-cookie`);
});

test('handles same-site cookies', async (t) => {
	const jar = new CookieJar();
	const client = withCookieJar(ky, { jar });

	server.get('/same-site-cookie', (request, response) => {
		response.setHeader('Set-Cookie', 'session=xyz; SameSite=Strict');
		response.send({ success: true });
	});

	server.get('/verify-cookie', (request, response) => {
		t.is(request.headers.cookie, 'session=xyz');
		response.send({ success: true });
	});

	// Set the SameSite cookie
	await client.get(`${server.url}/same-site-cookie`);

	// Verify the cookie is sent on same-site request
	await client.get(`${server.url}/verify-cookie`);

	const cookies = await jar.getCookieString(server.url);
	t.true(cookies.includes('session=xyz'));
});
