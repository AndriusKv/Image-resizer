import { expect } from "chai";
import * as angle from "./../src/js/dev/cropper/cropper.angle.js";

describe("Cropper angle", () => {
    it("should get angle", () => {
        expect(angle.get()).to.be.a("number");
    });

    it("should convert radians to degrees", () => {
        expect(angle.convertRadiansToDegrees(0)).to.equal(0);
        expect(angle.convertRadiansToDegrees(3.14)).to.equal(180);
        expect(angle.convertRadiansToDegrees(-2)).to.equal(245);
        expect(angle.convertRadiansToDegrees(8)).to.equal(458);
    });

    it("should reset angle", () => {
        angle.set(180, "rad");
        angle.reset();

        expect(angle.get()).to.equal(0);
    });

    describe("angle.set", () => {
        it("should set angle", () => {
            angle.set(180, "rad");

            expect(angle.get()).to.equal(Math.PI);

            angle.set(3.14, "deg");

            expect(angle.get()).to.equal(3.14);
        });

        it("should return angle in radians", () => {
            expect(angle.set(180, "rad")).to.equal(Math.PI);
        });

        it("should return angle in degrees", () => {
            expect(angle.set(3.14, "deg")).to.equal(180);
        });
    });
});
