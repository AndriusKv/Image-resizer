import { expect } from "chai";
import * as angle from "./../src/js/dev/cropper/cropper.angle.js";

describe("Cropper angle", () => {
    it("should get angle", () => {
        expect(angle.get()).to.be.a("number");
    });

    it("should reset angle", () => {
        angle.setInDegrees(180);
        angle.reset();

        expect(angle.get()).to.equal(0);
    });

    it("should set angle in degrees", () => {
        angle.setInDegrees(180);
        expect(angle.get()).to.equal(Math.PI);
    });

    it("should set angle in radians", () => {
        angle.setInRadians(Math.PI);
        expect(angle.get()).to.equal(Math.PI);
    });

    it("should return angle in radians", () => {
        expect(angle.setInDegrees(180)).to.equal(Math.PI);
    });

    it("should return angle in degrees", () => {
        expect(angle.setInRadians(Math.PI)).to.equal(180);
    });
});
