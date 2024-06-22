import xml.etree.ElementTree as ET
from sys import argv
from collections import defaultdict
import re

root = ET.parse(argv[1]).getroot()

entities = {}
prefixes = []


def capitalize(s: str):
    s = s.lower()
    for m in re.findall(r"\b\w+", s):
        s = s.replace(m, m.capitalize(), 1)
    return s


for child in root:
    if child.tag == "entities":
        for entity in child:
            name = adif = None
            for prop in entity:
                if prop.tag == "name":
                    name = prop.text
                if prop.tag == "adif":
                    adif = int(prop.text)
            entities[adif] = capitalize(name)
    if child.tag == "prefixes":
        for prefix in child:
            call = entity = end = None
            for prop in prefix:
                if prop.tag == "call":
                    call = prop.text
                if prop.tag == "adif":
                    entity = int(prop.text)
                if prop.tag == "end":
                    end = prop.text
            if end and end < "2024-06-20":
                continue
            # if entity != 1:
            #     continue
            prefixes.append((call, entity))

# print(len(prefixes), "prefixes found")

# Build trie


class Node:
    counter = 0

    def __init__(self):
        Node.counter += 1
        self.id = Node.counter
        self.parent: Node = None
        self.children: dict[str, Node] = {}
        self.entity: int = None


root = Node()
allNodes = []


# Build trie
def insert(node: Node, prefix, entity):
    if not prefix:
        if node.entity and node.entity != entity:
            print(f"Conflict: {node.entity} vs {entity}")
        node.entity = entity
        return
    nextNode = node.children.get(prefix[0])
    if not nextNode:
        nextNode = Node()
        nextNode.parent = node
        node.children[prefix[0]] = nextNode
        allNodes.append(nextNode)
    insert(nextNode, prefix[1:], entity)


for call, entity in prefixes:
    insert(root, call, entity)


# Merge nodes
# print("Merge start,", len(allNodes), "nodes")


def canMerge(node: Node, other: Node):
    if node.entity != other.entity:
        return False
    l = set(node.children.keys()).union(other.children.keys())
    return all(node.children.get(k) == other.children.get(k) for k in l)


def merge(first: Node, second: Node):
    # if first.id > second.id:
    #     first, second = second, first
    for k, c in second.children.items():
        c.parent = first
    for k, c in second.parent.children.items():
        if c == second:
            second.parent.children[k] = first
    allNodes.remove(second)


anyChanged = True
while anyChanged:
    anyChanged = False
    i = 0
    while i < len(allNodes):
        node = allNodes[i]
        for other in allNodes:
            if node != other and canMerge(node, other):
                anyChanged = True
                merge(node, other)
                break
        else:
            i += 1

for i in range(len(allNodes)):
    for j in range(i + 1, len(allNodes)):
        if canMerge(allNodes[i], allNodes[j]):
            raise Exception("Merge not completed")

# for n in allNodes:
#     print(n.children.items())
# print("Merge done,", len(allNodes), "nodes left")

# Save compiled trie

for node in [root, *allNodes]:
    if node.entity:
        print(f"{node.id}={node.entity}")
    for c in set(node.children.values()):
        print(
            f"{node.id}-{''.join(sorted(k for k, v in node.children.items() if v == c))}-{c.id}"
        )

# Print trie


def rangeToStr(a: str, b: str):
    if a == b:
        return a
    if ord(b) - ord(a) > 1:
        return f"{a}-{b}"
    return f"{a}{b}"


def toRange(s: list[str]):
    s = sorted(s)
    ranges = [(s[0], s[0])]
    for c in s[1:]:
        if ord(c) == ord(ranges[-1][1]) + 1:
            ranges[-1] = (ranges[-1][0], c)
        else:
            ranges.append((c, c))
    return "".join(rangeToStr(a, b) for a, b in ranges)


defined = set()


def genGraphvizNode(node: Node):
    label = "" if not node.entity else entities[node.entity]
    shape = "circle" if not node.entity else "box"
    return f'  {node.id} [label="{label}" shape="{shape}"];'


def toGraphviz(node: Node, root=True):
    ret = []
    if node in defined:
        return ret
    defined.add(node)

    ret.append(genGraphvizNode(node))

    dd = defaultdict(list)
    for k, c in node.children.items():
        dd[c.id].append(k.replace("/", "_"))
        ret += toGraphviz(c, False)

    for k in sorted(dd.keys()):
        ret.append(f'  {node.id} -> {k} [label="{toRange(dd[k])}"];')

    if root:
        curr = node
        while curr.parent:
            ret.append(genGraphvizNode(curr.parent))
            label = toRange(k for k, v in curr.parent.children.items() if v == curr)
            ret.append(f'  {curr.parent.id} -> {curr.id} [label="{label}"];')
            curr = curr.parent
        ret = "\n".join(["digraph {", *ret, "}"])

    return ret


def traverse(s: str, node: Node = root):
    if not s:
        return node
    nextNode = node.children.get(s[0])
    if not nextNode:
        return None
    return traverse(s[1:], nextNode)


# print(toGraphviz(traverse("R")))
