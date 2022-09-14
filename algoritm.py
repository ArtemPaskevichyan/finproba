import csv
import json
from sys import argv

first, inputFile, outputFile = argv


SPLIT = "SPLIT"
END = "END"
JOINT = "JOINT"
DEFAULT = "DEFAULT"


class Block:
    level: int
    text: str
    id: str
    status: str

    def __init__(self, id, level, text, status):
        self.level = level
        self.text = text
        self.id = id
        self.status = status
        self.afterList = []
        self.beforeList = []

    def __eq__(self, other):
        pass

    def __index__(self):
        pass

    def __str__(self):
        return " ".join((self.id, self.text,str(self.level), self.status, "beforeList: ", ";".join(self.beforeList), "afterList: ", ";".join(self.afterList)))

mainArrayOfBlocks = []

f = open(inputFile, "r", -1, "utf-8")
for a in f:
    if '"' in a:
        # print(a)
        if 'node' in a:
            lvl = a.find('<') // 4
            text = a[a.find('TEXT'):a.find('FOLDED')].split('"')[1].replace('&quot;', '"')
            id = a[a.find('ID'):a.rfind('>')].split('"')[1]

            block = Block(id, lvl, text, None)

            if 'JOINED' in a:
                block.status = JOINT
                block.id = a[a.find('X_COGGLE'):a.rfind('>')].split('"')[1]
                for j in mainArrayOfBlocks:
                    if j.id == block.id:
                        block = j
                        break
        if 'edge' in a:
            # print(a)
            color = a.split('"')[1]
            # print(a, color)
            if block.status != JOINT:
                if color == '#e096e9':
                    status = SPLIT  # split
                elif color == '#67d7c4':
                    status = END  # end
                else:
                    status = DEFAULT  # casual
                block.status = status
            mainArrayOfBlocks.append(block)

nextDict = {}

for i in mainArrayOfBlocks:
    print(i)

for i in range(1, len(mainArrayOfBlocks)-1):
    last, cur, next = mainArrayOfBlocks[i-1], mainArrayOfBlocks[i], mainArrayOfBlocks[i+1]
    print('cur', cur)
    if cur.level - last.level == 1:
        # print("A")
        if cur.status == DEFAULT:
            cur.beforeList.append(last.id)
            if next.level-cur.level == 1:
                cur.afterList.append(next.id)
        elif cur.status == END:
            cur.beforeList.append(last.id)
        elif cur.status == SPLIT:
            cur.beforeList.append(last.id)
            if next.level - cur.level == 1:
                cur.afterList.append(f"{next.text.split('>')[0]}|{next.id}")
            nextDict[cur.level + 1] = cur.id
    else:
        # print("B")
        if cur.status == DEFAULT:
            cur.beforeList.append(nextDict[cur.level])
            if next.level - cur.level == 1:
                cur.afterList.append(next.id)
            for j in mainArrayOfBlocks:
                if nextDict[cur.level] == j.id:
                    j.afterList.append(f"{cur.text.split('>')[0]}|{cur.id}")
                    break
        elif cur.status == END:
            cur.beforeList.append(nextDict[cur.level])
            for j in mainArrayOfBlocks:
                if nextDict[cur.level] == j.id:
                    j.afterList.append(f"{cur.text.split('>')[0]}|{cur.id}")
                    break
        elif cur.status == SPLIT:
            cur.beforeList.append(nextDict[cur.level])
            if next.level - cur.level == 1:
                cur.afterList.append(f"{cur.text.split('>')[0]}|{next.id}")
            nextDict[cur.level + 1] = cur.id
            for j in mainArrayOfBlocks:
                if nextDict[cur.level] == j.id:
                    j.afterList.append(f"{cur.text.split('>')[0]}|{cur.id}")
                    break

last, cur = mainArrayOfBlocks[-2], mainArrayOfBlocks[-1]
if cur.level - last.level == 1:
    cur.beforeList.append(last.id)
else:
    cur.beforeList.append(nextDict[cur.level])
    for j in mainArrayOfBlocks:
        if nextDict[cur.level] == j.id:
            j.afterList.append(cur.id)
            break

finalResultList = []
for i in mainArrayOfBlocks:
    if i not in finalResultList:
        finalResultList.append(i)

deleteCards = []

for i in finalResultList[1:]:
    print(mainArrayOfBlocks[0].text, i.id, i.text[i.text.find('>')+1:], i.beforeList, i.afterList)
    if len(i.afterList) > 1:
        # print("Карточка содержит вопросы: поиск карточек, на которые ведут вопросы")

        for n in i.afterList:
            buff=""
            question=""
            for b in n:
                if b == "|":
                    question = buff
                    buff = ""
                else:
                    buff += b

            for f in finalResultList[1:]:
                if f.id == buff:
                    deleteCards.append(f.id)
                    # print("Новый id для ссылки:", f.afterList)
                    # print(f"{question}:{f.afterList[0]}")
                    index = i.afterList.index(n)
                    if '#correct' in question:
                        i.afterList[index] = question.split(" #")[0] + '|' + 'True' + "|"
                    else:
                        i.afterList[index] = question.split(" #")[0] + '|' + 'False' + "|"
                    if '#cost' in question:
                        i.afterList[index]+=f'{question.split("#cost")[1].split()[0]}|'
                    else:
                        i.afterList[index]+='0|'
                    i.afterList[index]+=f.afterList[0]


print(deleteCards)

with open(outputFile, "w") as f:
    f.write('chapter;chapterImg;id;text;before;next;img\n')
    for i in finalResultList[1:]:
        if i.id in deleteCards:
            continue
        else:
            if ' #img ' in mainArrayOfBlocks[0].text:
                f.write(f'{mainArrayOfBlocks[0].text.split(" #")[0]};{mainArrayOfBlocks[0].text.split("#img")[1].split()[0]};')
            else:
                f.write(f'{mainArrayOfBlocks[0].text};;')


            # print(i.afterList)
            if ' #img ' in i.text:
                f.write(';'.join([i.id, i.text.split('#')[0], "&".join(i.beforeList), "&".join(i.afterList), i.text.split(' #img ')[1]]))
            else:
                f.write(';'.join([i.id, i.text, "&".join(i.beforeList), "&".join(i.afterList), '']))
            # if ' #pay ' in i.text:
            #     f.write(f';{i.text.split(" #pay ")[1].split()[0]};')
            # else:
            #     f.write(';0;')
            # if ' #correct ' in i.text:
            #     f.write('True;')
            # else:
            #     f.write('False;')
            f.write('\n')

for i in mainArrayOfBlocks:
    print(i)