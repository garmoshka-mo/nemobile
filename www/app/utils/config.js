function Config(defaults) {

    return function(key) {
        var def = defaults[key];
        var stored = localStorage[key];
        if (_.isUndefined(def)) {
            if (stored === 'true') return true;
            else if (stored === 'false') return false;
            else if (_.isUndefined(stored)) return false;
            else return stored;
        } else if (def === true || def === false)
            return stored === 'true' || def;
        else
            return stored || def;
    };

}

