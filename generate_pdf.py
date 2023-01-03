import sys
import pdfrw
from pypdf import PdfMerger
from character import Character


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


def merge_pdfs(input_pdfs: list, output_pdf_path: str):
    merger = PdfMerger()

    for pdf in input_pdfs:
        merger.append(pdf)

    merger.write(output_pdf_path)
    merger.close()


if __name__ == "__main__":
    pdf_template = "char-sheet.pdf"
    cli_vars = dict(arg.split("=") for arg in sys.argv[1:] if "=" in arg)
    char = Character(classname=cli_vars["class"])
    pdf_output = f"output/{char.class_name} {char.name}.pdf"
    data = {
        # "Name": char.name,
        "Background": char.class_name,
        "STR": char.STR,
        "DEX": char.DEX,
        "WIL": char.WIL,
        "Max HP": char.hp,
        "Level": "1",
        "SP": char.sp,
        "Slots": char.slots,
        "Spells": char.spell,
    }
    if char.mount:
        data["Mount Slots"] = char.mount["Slots"]
    fill_pdf(pdf_template, pdf_output, data)
    print(char.appearance)
    print(char.personality)
    print(char.equipment)
