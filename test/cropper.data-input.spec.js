import * as input from "./../src/js/cropper/cropper.data-input.js";

describe("Data input", () => {
    document.body.insertAdjacentHTML("beforeend", `
        <input type="text" id="js-crop-x" value="80" />
        <input type="text" id="js-crop-y" value="100" />
        <input type="text" id="js-crop-width" value="200" />
        <input type="text" id="js-crop-height" value="180" />
        <input type="text" id="js-crop-angle" value="45" />
        <input type="text" id="js-crop-scale" value="90" />
        <input type="range" id="js-crop-quality" value="0.92" />
        <div id="js-crop-quality-display">0.92</div>
    `);

    it("should return input value", () => {
        expect(input.getValue("x")).toBe("80");
        expect(input.getValue("y")).toBe("100");
        expect(input.getValue("width")).toBe("200");
        expect(input.getValue("height")).toBe("180");
        expect(input.getValue("angle")).toBe("45");
        expect(input.getValue("scale")).toBe("90");
        expect(input.getValue("quality")).toBe("0.92");
    });

    it("should set input value", () => {
        input.setValue("x", 200);
        input.setValue("quality-display", 0.8);

        expect(input.getValue("x")).toBe("200");
        expect(document.getElementById("js-crop-quality-display").textContent).toBe("0.8");
    });

    it("should update inputs", () => {
        const area = {
            x: 50.8,
            y: 60.4,
            width: 100.9,
            height: 150.1
        };

        input.update(area);

        expect(input.getValue("x")).toBe("50");
        expect(input.getValue("y")).toBe("60");
        expect(input.getValue("width")).toBe("100");
        expect(input.getValue("height")).toBe("150");
    });

    it("should update inputs with negative values", () => {
        const area = {
            x: 50.8,
            y: 60.4,
            width: -100.9,
            height: -150.1
        };

        input.update(area);

        expect(input.getValue("x")).toBe("-51");
        expect(input.getValue("y")).toBe("-90");
        expect(input.getValue("width")).toBe("101");
        expect(input.getValue("height")).toBe("151");
    });

    it("should update inputs with missing start point", () => {
        const area = {
            width: -100.9,
            height: -150.1
        };

        input.update(area);

        expect(input.getValue("x")).toBe("0");
        expect(input.getValue("y")).toBe("0");
    });
});
