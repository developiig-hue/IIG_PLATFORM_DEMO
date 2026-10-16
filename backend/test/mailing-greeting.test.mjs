import test from "node:test";
import assert from "node:assert/strict";
import {mailingGreeting} from "../src/mailing-greeting.mjs";

test("UA female explicit appeal_ua is used verbatim",()=>{
  assert.equal(
    mailingGreeting({name:"Алла Олегівна Коваленко",gender:"F",appeal_ua:"Шановна Алла Олегівна!"},"UA"),
    "Шановна Алла Олегівна!"
  );
});

test("UA female fallback keeps first name and patronymic in nominative",()=>{
  assert.equal(
    mailingGreeting({name:"Олена Олександрівна Коваль",gender:"F",appeal_ua:""},"UA"),
    "Шановна Олена Олександрівна!"
  );
  assert.equal(
    mailingGreeting({name:"Олена Коваль",gender:"F"},"UA"),
    "Шановна Олена!"
  );
});

test("UA uncertain contact uses neutral greeting",()=>{
  assert.equal(mailingGreeting({name:"MALBI GROUP",gender:""},"UA"),"Вітаємо!");
});

test("EN remains gender-neutral",()=>{
  assert.equal(mailingGreeting({name:"Olena Kovalenko",gender:"F"},"EN"),"Dear Olena Kovalenko!");
});
