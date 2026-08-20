# Wire Return Data Extraction Rules

When extracting, parsing, or importing scrap wire return data from construction documents (e.g., PEA PDF reports) into the system:

1. **Only extract data from Demolition Departments (แผนกรื้อถอน)**
   - Allowed departments include: HT-R-E, TR-R-E, LT-R-E, TL-R-E.
   - You MUST NOT extract any wire or material data from Construction Departments (แผนกก่อสร้าง) such as HT-C-E, LT-C-E, TR-C-E, TL-C-E.

2. **Exclude "ลวดเหล็กตีเกลียว" (Steel Stranded Wire)**
   - You MUST NOT include any wire data or weights that fall under the "ลวดเหล็กตีเกลียว" category (e.g., ST. WIRE, STRANDED or เศษเหล็กและวัสดุ).
   - Skip these items completely when preparing database seed scripts or updating the UI.

3. **Calculate True Scrap Wire Length**
   - The PDF tables contain an "Estimated" column (จํานวนพัสดุ ตามประมาณการ) and a "Good Material Returned" column (จํานวนพัสดุดี ส่งคืนคลัง).
   - The TRUE amount of scrap wire is calculated as: `Scrap Length = Estimated - Good Material Returned`.
   - Wires where `Estimated - Good Material Returned = 0` should be completely omitted from scrap calculations as they yielded no scrap.

# Network Abbreviation Mapping Rules

When displaying or printing network names from documents, use these full names instead of abbreviations:
- HT-C-E -> แผนกก่อสร้างแรงสูงภายนอก
- HT-R-E -> แผนกรื้อถอนแรงสูงภายนอก
- TR-C-E -> แผนกก่อสร้างหม้อแปลงภายนอก
- TR-R-E -> แผนกรื้อถอนหม้อแปลงภายนอก
- LT-C-E -> แผนกก่อสร้างแรงต่ำภายนอก
- LT-R-E -> แผนกรื้อถอนแรงต่ำภายนอก
- TL-C-E -> แผนกก่อสร้างสายส่งภายนอก
- TL-R-E -> แผนกรื้อถอนสายส่งภายนอก
