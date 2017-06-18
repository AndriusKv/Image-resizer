import * as direction from "./../src/js/cropper/cropper.direction.js";

describe("Cropper direction", () => {
    describe("direction.get", () => {
        const area = {
            x: 100,
            y: 120,
            width: 200,
            height: 160
        };

        it("should not get direction", () => {
            direction.set(48, 100, area);
            expect(direction.get()).toBe("");

            direction.set(132, 200, area);
            expect(direction.get()).toBe("");
        });

        it("should get north-west direction", () => {
            direction.set(102, 119, area);

            expect(direction.get()).toBe("nw");
        });

        it("should get north-east direction", () => {
            direction.set(297, 120, area);

            expect(direction.get()).toBe("ne");
        });

        it("should get south-east direction", () => {
            direction.set(300, 284, area);

            expect(direction.get()).toBe("se");
        });

        it("should get south-west direction", () => {
            direction.set(98, 276, area);

            expect(direction.get()).toBe("sw");
        });

        it("should get north direction", () => {
            direction.set(214, 120, area);

            expect(direction.get()).toBe("n");
        });

        it("should get east direction", () => {
            direction.set(301, 200, area);

            expect(direction.get()).toBe("e");
        });

        it("should get south direction", () => {
            direction.set(120, 284, area);

            expect(direction.get()).toBe("s");
        });

        it("should get west direction", () => {
            direction.set(100, 200, area);

            expect(direction.get()).toBe("w");
        });
    });

    describe("direction.reverse", () => {
        it("should reverse direction when width is positive and height is negative", () => {
            const area = {
                x: 100,
                y: 120,
                width: 200,
                height: -160
            };

            expect(direction.reverse("nw", area)).toBe("ne");
        });

        it("should reverse direction when width is negative and height is positive", () => {
            const area = {
                x: 100,
                y: 120,
                width: -200,
                height: 160
            };

            expect(direction.reverse("nw", area)).toBe("ne");
        });

        it("should not reverse direction if both with and height are positive", () => {
            const area = {
                x: 100,
                y: 120,
                width: 200,
                height: 160
            };

            expect(direction.reverse("nw", area)).toBe("nw");
        });
    });

    describe("direction.getReal", () => {
        it("should get cardinal direction", () => {
            const area = {
                x: 100,
                y: 120,
                width: 200,
                height: 160
            };

            expect(direction.getReal(140, 119, area)).toBe("n");
            expect(direction.getReal(302, 148, area)).toBe("e");
            expect(direction.getReal(295, 284, area)).toBe("s");
            expect(direction.getReal(100, 125, area)).toBe("w");
        });

        it("should get intercardinal direction", () => {
            const area = {
                x: 100,
                y: 120,
                width: 200,
                height: 160
            };

            expect(direction.getReal(102, 119, area)).toBe("nw");
            expect(direction.getReal(297, 120, area)).toBe("ne");
            expect(direction.getReal(300, 284, area)).toBe("se");
            expect(direction.getReal(98, 276, area)).toBe("sw");
        });

        it("should get north sided opposite intercardinal direction", () => {
            const area = {
                x: 400,
                y: 120,
                width: -200,
                height: 160
            };

            expect(direction.getReal(402, 119, area)).toBe("ne");
            expect(direction.getReal(200, 120, area)).toBe("nw");
        });

        it("should get south sided opposite intercardinal direction", () => {
            const area = {
                x: 400,
                y: 200,
                width: 200,
                height: -160
            };

            expect(direction.getReal(600, 40, area)).toBe("sw");
            expect(direction.getReal(400, 40, area)).toBe("se");
        });

        it("should get opposite intercardinal direction", () => {
            const area = {
                x: 400,
                y: 200,
                width: -200,
                height: -160
            };

            expect(direction.getReal(200, 200, area)).toBe("ne");
            expect(direction.getReal(400, 200, area)).toBe("nw");
            expect(direction.getReal(400, 40, area)).toBe("sw");
            expect(direction.getReal(200, 40, area)).toBe("se");
        });
    });
});
