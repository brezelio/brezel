<!DOCTYPE html>
<html lang="de">

<head>
    <meta charset="utf-8">
    <title>footer</title>
    <style>
        html {
            font-family: 'TeX Gyre Heros', serif;
        }
    </style>
</head>

<body style="margin: 0; padding: 0 20mm 0 25mm; height: 37mm;" onload="subst()">
    <section style="height: 100%; background: none;position: relative; top: 5mm;">
        <section style="background: white; text-align: right; padding: 4.23mm 0; ">
            Page <span class="page"></span> of <span class="topage"></span>
        </section>
        <section style="text-align: center;">
            <hr>
            <p style="text-align: center;">
            Footer <br>    
            Bank Details
            </p>
        </section>
    </section>
</body>
<script>
    function subst() {
        var vars = {}
        var query_strings_from_url = document.location.search.substring(1).split('&')
        for (var query_string in query_strings_from_url) {
            if (query_strings_from_url.hasOwnProperty(query_string)) {
                var temp_var = query_strings_from_url[query_string].split('=', 2)
                vars[temp_var[0]] = decodeURI(temp_var[1])
            }
        }
        var css_selector_classes = ['page', 'frompage', 'topage', 'webpage', 'section', 'subsection', 'date', 'isodate', 'time', 'title', 'doctitle', 'sitepage', 'sitepages']
        for (var css_class in css_selector_classes) {
            if (css_selector_classes.hasOwnProperty(css_class)) {
                var element = document.getElementsByClassName(css_selector_classes[css_class])
                for (var j = 0; j < element.length; ++j) {
                    element[j].textContent = vars[css_selector_classes[css_class]]
                }
            }
        }
    }
</script>

</html>