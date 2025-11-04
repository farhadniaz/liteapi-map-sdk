// Polyfill for TextDecoder/TextEncoder required by mapbox-gl
import { TextEncoder, TextDecoder } from 'util';
import fetch, { Headers, Request, Response } from 'node-fetch';

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
global.fetch = fetch;
global.Headers = Headers;
global.Request = Request;
global.Response = Response;
