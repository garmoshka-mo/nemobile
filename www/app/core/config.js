function Config(defaults) {

    return function(key) {
        var def = defaults[key];
        var stored = localStorage[key];
        if (_.isUndefined(def) || def === true || def === false) {
            if (stored === 'true') return true;
            else if (stored === 'false') return false;
            else if (_.isUndefined(stored)) return def || false;
            else return stored;
        } else
            return stored || def;
    };

}

