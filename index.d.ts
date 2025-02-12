import type { CookieJar } from 'tough-cookie';
import type { KyInstance } from 'ky-universal';

export type CookieJarOptions = {
	/**
	 * The cookie jar instance to use for storing cookies
	 */
	jar: CookieJar;
};

/**
 * Extends a Ky instance with cookie jar support
 *
 * @param options - Configuration options containing the cookie jar
 * @returns A new Ky instance with cookie jar support
 *
 * @example
 * ```typescript
 * import { CookieJar } from 'tough-cookie';
 * import { withCookieJar } from 'ky-cookie-jar';
 *
 * const jar = new CookieJar();
 * const client = withCookieJar({ jar });
 *
 * // The client will now automatically handle cookies
 * const response = await client.get('https://api.example.com');
 * ```
 */
export function withCookieJar(
	kyInstance: KyInstance,
	options: CookieJarOptions,
): KyInstance;
