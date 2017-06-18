import * as angle from "./../src/js/cropper/cropper.angle.js";

describe("Cropper angle", () => {
    it("should get angle", () => {
        expect(angle.get()).toBe(0);
    });

    it("should reset angle", () => {
        angle.setInDegrees(180);
        angle.reset();

        expect(angle.get()).toBe(0);
    });

    it("should set angle in degrees", () => {
        angle.setInDegrees(180);
        expect(angle.get()).toBe(Math.PI);

        angle.setInDegrees(270);
        expect(angle.get()).toBe(Math.PI / 2 - Math.PI);
    });

    it("should set angle in radians", () => {
        angle.setInRadians(Math.PI);
        expect(angle.get()).toBe(Math.PI);

        angle.setInRadians(0);
        expect(angle.get()).toBe(0);

        angle.setInRadians(Math.PI * 2);
        expect(angle.get()).toBe(0);
    });

    it("should return correct angle in degrees", () => {
        expect(angle.setInRadians(Math.PI * 3)).toBe(180);
        expect(angle.setInRadians(-Math.PI * 3)).toBe(180);
    });

    it("should return angle in degrees", () => {
        expect(angle.setInRadians(Math.PI)).toBe(180);
    });

    it("should return angle in radians", () => {
        expect(angle.setInDegrees(180)).toBe(Math.PI);
    });
});
