import uuid

from sqlmodel import Field, Relationship, SQLModel

class DOI(SQLModel, table=True):
    # even though link is unique, use UUID for primary key since its much better to access a doi page in our app by going to ourapp.com/doi/{id} than ourapp.com/doi/{link}
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    link: str = Field(min_length=1, max_length=255, unique=True)
    ref_title: str = Field(min_length=1, max_length=255)
    authors: str = Field(min_length=1, max_length=255)
    pub_year: int = Field()
    specimens: list["Specimen"] = Relationship(back_populates="doi")
