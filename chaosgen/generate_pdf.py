import os
import sys

import pdfrw
from pypdf import PdfMerger

import chaosgen.character_class as character_class
import chaosgen.dice as dice
from chaosgen.character import Character


def fill_pdf(input_pdf_path: str, output_pdf_path: str, data_dict: dict):
    ANNOT_KEY = "/Annots"
    ANNOT_FIELD_KEY = "/T"
    SUBTYPE_KEY = "/Subtype"
    WIDGET_SUBTYPE_KEY = "/Widget"
    template_pdf = pdfrw.PdfReader(input_pdf_path)
    for page in template_pdf.pages:
        annotations = page[ANNOT_KEY]
        for annotation in annotations:
            if annotation[SUBTYPE_KEY] == WIDGET_SUBTYPE_KEY:
                if annotation[ANNOT_FIELD_KEY]:
                    key = annotation[ANNOT_FIELD_KEY][1:-1]
                    if key in data_dict.keys():
                        if isinstance(data_dict[key], bool):
                            if data_dict[key] is True:
                                annotation.update(pdfrw.PdfDict(AS=pdfrw.PdfName("Yes")))
                        else:
                            annotation.update(pdfrw.PdfDict(V=f"{data_dict[key]}"))
                            annotation.update(pdfrw.PdfDict(AP=""))
    template_pdf.Root.AcroForm.update(
        pdfrw.PdfDict(NeedAppearances=pdfrw.PdfObject("true"))
    )
    pdfrw.PdfWriter().write(output_pdf_path, template_pdf)
    return output_pdf_path


def merge_pdfs(input_pdfs: list, output_pdf_path: str):
    merger = PdfMerger()

    for pdf in input_pdfs:
        merger.append(pdf)

    merger.write(output_pdf_path)
    merger.close()


def generate_char(classname="random"):
    pdf_template = "templates/char-sheet.pdf"
    char = Character(classname=classname)
    pdf_output = f"output/{char.class_name} {char.name}.pdf"
    merge_list = []
    tmp_hirelings: str = None
    data = {
        # "Name": char.name,
        "Background": f"{char.class_name} ({char.archetype})",
        "STR": char.STR,
        "DEX": char.DEX,
        "WIL": char.WIL,
        "Max Stamina": char.stamina,
        "Level": "1",
        "SP": char.sp,
        "Slots": char.slots,
        "Spells": char.spell,
        "Notes": char.notes,
    }
    if char.mount:
        data["Mount Slots"] = char.mount["Slots"]
        if char.mount["equipment"]:
            for index, item in enumerate(char.mount["equipment"]):
                data["Mount" + str(index + 1)] = item
        if char.retainer:
            tmp_hirelings = generate_hirelings(char, "mount/hireling")
        else:
            tmp_hirelings = generate_hirelings(char, "mount")
    elif char.retainer:
        tmp_hirelings = generate_hirelings(char, "hireling")
    for index, item in enumerate(char.equipment):
        data["Item" + str(index + 1)] = item

    merge_list.append(fill_pdf(pdf_template, pdf_output, data))
    if tmp_hirelings:
        merge_list.append(tmp_hirelings)
    merge_pdfs(merge_list, pdf_output)
    if tmp_hirelings:
        os.remove(tmp_hirelings)
    return pdf_output


def generate_hirelings(char, h_type: str):
    pdf_template = "templates/hireling-sheet.pdf"
    pdf_output = f"output/{char.class_name} {char.name} Hirelings.pdf"
    data = {}
    if h_type == "mount/hireling":
        data["Role1"] = char.mount["name"]
        data["Skill1"] = char.mount["Skill"]
        data["Morale1"] = char.mount["ML"]
        data["Max STAMINA1"] = dice.xdy(char.mount["HD"], 8)
        data["Cost1"] = "N/A"
        for i in range(10):
            data["HItem" + str(i + 1)] = "------ Use Slots on Character Sheet ------"
        data["Role2"] = char.retainer["name"]
        data["Skill2"] = char.retainer["Skill"]
        data["Morale2"] = char.retainer["ML"]
        data["Max STAMINA2"] = dice.xdy(char.retainer["HD"], 8)
        data["Cost2"] = "N/A"
        data["Level2"] = "1"
        for index, item in enumerate(char.retainer["equipment"]):
            data["HItem" + str(index + 11)] = item
    if h_type == "hireling":
        data["Role1"] = char.retainer["name"]
        data["Skill1"] = char.retainer["Skill"]
        data["Morale1"] = char.retainer["ML"]
        data["Max STAMINA1"] = dice.xdy(char.retainer["HD"], 8)
        data["Cost1"] = "N/A"
        data["Level1"] = "1"
        for index, item in enumerate(char.retainer["equipment"]):
            data["HItem" + str(index + 1)] = item
    if h_type == "mount":
        data["Role1"] = char.mount["name"]
        data["Skill1"] = char.mount["Skill"]
        data["Morale1"] = char.mount["ML"]
        data["Max STAMINA1"] = dice.xdy(char.mount["HD"], 8)
        data["Cost1"] = "N/A"
        for i in range(10):
            data["HItem" + str(i + 1)] = "------ Use Slots on Character Sheet ------"

    return fill_pdf(pdf_template, pdf_output, data)


if __name__ == "__main__":
    cli_vars = dict(arg.split("=") for arg in sys.argv[1:] if "=" in arg)
    kwargs = {}
    num = 1
    merge_list = []
    if "num" in cli_vars:
        num = int(cli_vars["num"])
        if num < 1:
            sys.exit("Amount must be greater than 0")
        if num > 20:
            sys.exit("Amount must be no more than 20")
    if "class" in cli_vars:
        kwargs["classname"] = cli_vars["class"]
    os.makedirs("output", exist_ok=True)
    if kwargs["classname"] == "all":
        for character in character_class.VALID_BACKGROUND_NAMES:
            merge_list.append(generate_char(classname=character))
    else:
        for i in range(num):
            merge_list.append(
                generate_char(**{k: v for k, v in kwargs.items() if v is not None})
            )
    # The below will stay commented until I find a way to not overwrite the annotations when merging
    # merge_pdfs(merge_list, "output/all chars.pdf")
