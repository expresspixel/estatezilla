#### Requires ####
# goslate==1.3.0
# polib==1.0.5
#### / ####

import os, sys
import goslate

import argparse
import polib
import time
import datetime

parser = argparse.ArgumentParser(description="Machine Translation of Django's PO Files")

parser.add_argument('--inpath', help="Path to the INPUT po file", required=True)
parser.add_argument('--outpath', help="Path to the OUTPUT po file", required=True)
parser.add_argument('--lang', help="Destination language ISO-3166-2alpha code", required=True)
parser.add_argument('--whoami', help="Your email address", default="you@example.com")
args = parser.parse_args()

gs = goslate.Goslate()

input_file = polib.pofile(args.inpath)
output_file = polib.POFile()

output_file.metadata = {
    'Project-Id-Version': '1.0',
    'Report-Msgid-Bugs-To': args.whoami,
    'POT-Creation-Date': time.strftime("%Y-%m-%d %H:%M%z"),
    'PO-Revision-Date': time.strftime("%Y-%m-%d %H:%M%z"),
    'Last-Translator': args.whoami,
    'Language-Team': 'English <%s>' % args.whoami,
    'Language': args.lang,
    'MIME-Version': '1.0',
    'Content-Type': 'text/plain; charset=utf-8',
    'Content-Transfer-Encoding': '8bit',
}



c=0
for entry in input_file:
    print entry.msgid.encode('utf-8'), entry.msgstr.encode('utf-8')
    
    translated_entry = polib.POEntry(
        msgid=unicode(entry.msgid),
        msgstr=unicode(gs.translate(entry.msgid, args.lang))
    )
    time.sleep(1)
    output_file.append(translated_entry)
    output_file.save(args.outpath)
    c += 1

output_file.save(args.outpath)
print "Done. Translated %s messages" % c
