"use client";

import {useMemo, useState} from "react";
import {Controller} from "react-hook-form";
import countryList from "react-select-country-list";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {ChevronDownIcon} from "lucide-react";

// Local type for the country options coming from `react-select-country-list`.
// The library typings are quite loose, so we narrow them here for TypeScript.
type CountryOption = {
    value: string;
    label: string;
};

const CountrySelectField = ({name, label, control, error, required = false}: CountrySelectProps) => {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");

    const countries = useMemo<CountryOption[]>(
        () => countryList().getData() as CountryOption[],
        [],
    );

    const filteredCountries = useMemo<CountryOption[]>(
        () =>
            countries.filter((country: CountryOption) =>
                country.label.toLowerCase().includes(search.toLowerCase()),
            ),
        [countries, search],
    );

    const getFlagEmoji = (countryCode: string): string =>
        countryCode
            .toUpperCase()
            .replace(/./g, (char) => String.fromCodePoint(127397 + char.charCodeAt(0)));

    return (
        <div className="space-y-2">
            <div className="flex flex-col gap-1">
                <Label htmlFor={name} className="form-label">
                    {label}
                </Label>

            </div>

            <Controller
                name={name}
                control={control}
                rules={{
                    required: required ? `Please select ${label.toLowerCase()}` : false,
                }}
                render={({field}) => {
                    const selectedCountry =
                        countries.find((country) => country.value === field.value) || null;

                    return (
                        <Popover open={open} onOpenChange={setOpen}>
                            <PopoverTrigger asChild>
                                <button
                                    type="button"
                                    className="country-select-trigger flex items-center gap-2"
                                >
                                    {selectedCountry ? (
                                        <div className="flex items-center gap-2">
                                            <span>{getFlagEmoji(selectedCountry.value)}</span>
                                            <span>{selectedCountry.label}</span>
                                        </div>
                                    ) : (
                                        <span className="text-gray-500">Select country</span>
                                    )}
                                    <ChevronDownIcon className="ml-auto h-4 w-4 opacity-60" />
                                </button>
                            </PopoverTrigger>

                            <PopoverContent className="w-[320px] p-0 bg-gray-800 border-gray-600">
                                <div className="border-b border-gray-600 px-3 py-2">
                                    <Input
                                        placeholder="Search country"
                                        className="country-select-input"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                </div>
                                <div className="max-h-64 overflow-y-auto p-2 space-y-1">
                                    {filteredCountries.length === 0 ? (
                                        <div className="country-select-empty">No countries found.</div>
                                    ) : (
                                        filteredCountries.map((country) => (
                                            <button
                                                key={country.value}
                                                type="button"
                                                className="country-select-item flex w-full items-center gap-2 text-left"
                                                onClick={() => {
                                                    field.onChange(country.value);
                                                    setOpen(false);
                                                }}
                                            >
                                                <span>{getFlagEmoji(country.value)}</span>
                                                <span>{country.label}</span>
                                            </button>
                                        ))
                                    )}
                                </div>
                            </PopoverContent>
                        </Popover>
                    );
                }}
            />
            <p className="text-xs text-gray-500">
                Helps us show market data and news relevant to you.
            </p>
            {error && <p className="text-red-500 text-sm">{error.message}</p>}
        </div>
    );
};

export default CountrySelectField;
