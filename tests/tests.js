QUnit.asyncTest("test if a normal xhr requests are handled correctly", function (assert) {
    expect(2);

    new Ajax("./data.json")
        .done(function (data) {
            assert.ok(typeof data === "string", "Data is a string.");
        })
        .always(function () {
            assert.ok(true, "Always callback is called when a successful request finishes.");
            QUnit.start();
        });

});

QUnit.asyncTest("test if failed requests are handled correctly", function (assert) {
    expect(1);

    new Ajax("./non-existent-data-source.json")
        .done(function () {
            assert.ok(false, "The non-existent file also calls the 'done' callback, which is not what is supposed to happen.");
        })
        .fail(function () {
            assert.ok(true, "The failed callback is called when the XHR request failed.");
        })
        .always(function () {
            QUnit.start();
        });
});

QUnit.asyncTest("test if json requests return a Object as data", function (assert) {
    expect(2);

    new Ajax("./data.json")
        .done(function (data) {
            assert.ok(typeof data === "object", "The data returned is of type 'Object'");
        }, "json")
        .always(function () {
            assert.ok(true, "The always callback is called when ")
            QUnit.start();
        });
});
