This tool uses the [IntellexApps' blcheck](https://github.com/IntellexApps/blcheck) script, all credits to them.

1. Install dependencies with `npm install`
2. Copy config.example.js to config.js
3. Replace by the corresponding values in config.js
4. Create the ``logs`` folder inside the project
5. Assign execute permissions to the ``blcheck`` file:

    <pre>chmod +x blcheck</pre>

6. Run with `npm start`

### Custom Blacklists
If you want to set your own custom set of blacklist sites, just create a `blacklists.txt` file with every blacklist site separated by a space.<br>
You have a template in the `blacklists.example.txt` file, just rename it to `blacklists.txt` to use it.