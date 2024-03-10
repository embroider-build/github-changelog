"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.__resetMockResponses = exports.__setMockResponses = void 0;
let mockResponses = {};
const defaultMockResponseParams = {
    status: 200,
    statusText: "OK",
    ok: true,
};
function fetch(url) {
    return __awaiter(this, void 0, void 0, function* () {
        const mockResponse = mockResponses[url];
        if (mockResponse) {
            const fullMockResponse = Object.assign(Object.assign({}, defaultMockResponseParams), mockResponse);
            return {
                status: fullMockResponse.status,
                statusText: fullMockResponse.statusText,
                ok: fullMockResponse.ok,
                json: () => Promise.resolve(fullMockResponse.body),
            };
        }
        throw new Error(`Unknown URL: ${url}`);
    });
}
exports.default = fetch;
function __setMockResponses(newMockResponses) {
    mockResponses = newMockResponses;
}
exports.__setMockResponses = __setMockResponses;
function __resetMockResponses() {
    __setMockResponses({});
}
exports.__resetMockResponses = __resetMockResponses;
