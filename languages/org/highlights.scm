; A Note on anonymous nodes (represented in a query file as strings). As of
; right now, anonymous nodes can not be anchored.
; See https://github.com/tree-sitter/tree-sitter/issues/1461

; Example highlighting for headlines. The headlines here will be matched
; cyclically, easily extended to match however your heart desires.
(headline (stars) @comment (#match? @comment "^(\\*{3})*\\*$") (item) @function)
(headline (stars) @comment (#match? @comment "^(\\*{3})*\\*\\*$") (item) @function)
(headline (stars) @comment (#match? @comment "^(\\*{3})*\\*\\*\\*$") (item) @function)

; This one should be generated after scanning for configuration, using
; something like #any-of? for keywords, but could use a match if allowing
; markup on todo keywords is desirable.
(item . (expr) @keyword (#eq? @keyword "TODO"))
(item . (expr) @keyword (#eq? @keyword "DONE"))
(item . (expr) @keyword (#match? @keyword "\[\d*/\d*\]"))
(item . (expr) @keyword (#match? @keyword "\[\d*%\]"))

; Not sure about this one with the anchors.
(item . (expr)? . (expr "[" "#" @preproc [ "num" "str" ] @preproc "]") @hint (#match? @hint "\[#.\]"))

(tag_list (tag) @tag) @tag.doctype

(property_drawer) @text.literal

; Properties are :name: vale, so to color the ':' we can either add them
; directly, or highlight the property separately from the name and value. If
; priorities are set properly, it should be simple to achieve.
(property name: (expr) @property (value)? @property) @property

; Simple examples, but can also match (day), (date), (time), etc.
(timestamp "[") @constant
(timestamp "<"
 (day)? @constant
 (date)? @constant
 (time)? @constant
 (repeat)? @constant
 (delay)? @constant
 ) @constant

; Like OrgProperty, easy to choose how the '[fn:LABEL] DESCRIPTION' are highlighted
(fndef label: (expr) @label (description) @label) @label

; Again like OrgProperty to change the styling of '#+' and ':'. Note that they
; can also be added in the query directly as anonymous nodes to style differently.
(directive name: (expr) @comment (value)? @comment) @comment

(comment) @comment

; At the moment, these three elements use one regex for the whole name.
; So (name) -> :name:, ideally this will not be the case, so it follows the
; patterns listed above, but that's the current status. Conflict issues.
(drawer name: (expr) @comment (contents)? @comment) @comment
(block name: (expr) @comment (contents)? @comment) @comment
(dynamic_block name: (expr) @comment (contents)? @comment) @comment

; Can match different styles with a (#match?) or (#eq?) predicate if desired
(bullet) @punctuation

; Get different colors for different statuses as follows
(checkbox) @punctuation
(checkbox status: (expr "-") @punctuation.bracket)
(checkbox status: (expr "str") @punctuation.delimiter (#any-of? @punctuation.delimiter "x" "X"))
(checkbox status: (expr) @punctuation.special (#not-any-of? @punctuation.special "x" "X" "-"))

; If you want the ruler one color and the separators a different color,
; something like this would do it:
; (hr "|" @OrgTableHRBar) @OrgTableHorizontalRuler
(hr) @comment

; Can do all sorts of fun highlighting here..
(cell (contents . (expr "=")) @hint (#match? @hint "^\d+([.,]\d+)*$"))

; Dollars, floats, etc. Strings.. all options to play with
(cell (contents . (expr "num") @hint (#match? @hint "^\d+([.,]\d+)*$") .))
