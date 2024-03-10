"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const configuration_error_1 = require("./configuration-error");
describe("ConfigurationError", function () {
    it("can be identified using `instanceof`", function () {
        const configError = new configuration_error_1.default("foobar");
        expect(configError instanceof configuration_error_1.default).toEqual(true);
        const error = new Error("foobar");
        expect(error instanceof configuration_error_1.default).toEqual(false);
    });
    it("`message` property equals first constructor argument", function () {
        const error = new configuration_error_1.default("foobar");
        expect(error.message).toEqual("foobar");
    });
});
